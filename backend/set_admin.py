"""관리자 권한 부여 유틸: python set_admin.py <email>"""
import asyncio
import sys
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.db_models import User


async def set_admin(email: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            print(f"[ERROR] 유저를 찾을 수 없습니다: {email}")
            return
        user.is_admin = True
        await db.commit()
        print(f"[OK] {email} → is_admin=True 설정 완료")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("사용법: python set_admin.py <email>")
        sys.exit(1)
    asyncio.run(set_admin(sys.argv[1]))
