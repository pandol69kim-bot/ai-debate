import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from app.db.session import get_db
from app.models.db_models import (
    Conversation, ConversationStatus, DebateRound, JudgeResult, ConsensusResult, User
)
from app.schemas.schemas import AdminConversationOut, AdminStatsOut
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
