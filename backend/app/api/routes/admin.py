import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from app.db.session import get_db
from app.models.db_models import (
    Conversation, ConversationStatus, DebateRound, JudgeResult, ConsensusResult, User
)
from app.schemas.schemas import AdminConversationOut, AdminStatsOut, AdminUserOut
from app.api.routes.auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/debates", response_model=list[AdminConversationOut])
async def admin_list_debates(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(Conversation).order_by(Conversation.created_at.desc())
    )
    conversations = result.scalars().all()

    out = []
    for c in conversations:
        user_email = None
        if c.user_id:
            ur = await db.execute(select(User).where(User.id == c.user_id))
            u = ur.scalar_one_or_none()
            if u:
                user_email = u.email

        round_r = await db.execute(
            select(func.count()).where(DebateRound.conversation_id == c.id)
        )
        round_count = round_r.scalar() or 0

        out.append(AdminConversationOut(
            id=c.id,
            topic=c.topic,
            status=c.status,
            selected_models=c.selected_models,
            user_email=user_email,
            round_count=round_count,
            created_at=c.created_at,
            completed_at=c.completed_at,
        ))
    return out


@router.get("/stats", response_model=AdminStatsOut)
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    total_debates = (await db.execute(select(func.count()).select_from(Conversation))).scalar() or 0
    done = (await db.execute(
        select(func.count()).where(Conversation.status == ConversationStatus.DONE)
    )).scalar() or 0
    failed = (await db.execute(
        select(func.count()).where(Conversation.status == ConversationStatus.FAILED)
    )).scalar() or 0
    running = (await db.execute(
        select(func.count()).where(Conversation.status == ConversationStatus.RUNNING)
    )).scalar() or 0
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0

    return AdminStatsOut(
        total_debates=total_debates,
        done=done,
        failed=failed,
        running=running,
        total_users=total_users,
    )


@router.delete("/debates/{debate_id}", status_code=204)
async def admin_delete_debate(
    debate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    conv = await db.get(Conversation, debate_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Debate not found")

    await db.execute(delete(DebateRound).where(DebateRound.conversation_id == debate_id))
    await db.execute(delete(JudgeResult).where(JudgeResult.conversation_id == debate_id))
    await db.execute(delete(ConsensusResult).where(ConsensusResult.conversation_id == debate_id))
    await db.delete(conv)
    await db.commit()


# ── 회원 관리 ──────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[AdminUserOut])
async def admin_list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    out = []
    for u in users:
        count_r = await db.execute(
            select(func.count()).where(Conversation.user_id == u.id)
        )
        debate_count = count_r.scalar() or 0
        out.append(AdminUserOut(
            id=u.id,
            email=u.email,
            name=u.name,
            plan=u.plan,
            is_admin=u.is_admin,
            debate_count=debate_count,
            created_at=u.created_at,
        ))
    return out


@router.patch("/users/{user_id}/toggle-admin", response_model=AdminUserOut)
async def admin_toggle_admin(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_admin_user),
):
    if user_id == current.id:
        raise HTTPException(status_code=400, detail="자기 자신의 권한은 변경할 수 없습니다")

    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.is_admin = not target.is_admin
    await db.commit()
    await db.refresh(target)

    count_r = await db.execute(
        select(func.count()).where(Conversation.user_id == target.id)
    )
    return AdminUserOut(
        id=target.id,
        email=target.email,
        name=target.name,
        plan=target.plan,
        is_admin=target.is_admin,
        debate_count=count_r.scalar() or 0,
        created_at=target.created_at,
    )


@router.delete("/users/{user_id}", status_code=204)
async def admin_delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_admin_user),
):
    if user_id == current.id:
        raise HTTPException(status_code=400, detail="자기 자신은 삭제할 수 없습니다")

    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # 연관 토론의 user_id를 NULL 처리하여 기록 보존
    from sqlalchemy import update
    await db.execute(
        update(Conversation).where(Conversation.user_id == user_id).values(user_id=None)
    )
    await db.delete(target)
    await db.commit()
