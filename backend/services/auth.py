import logging
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import User
from utils.jwt import create_access_token, create_refresh_token, create_password_reset_token, decode_password_reset_token
from hooks.error import UnauthorizedError, ConflictError, ForbiddenError, NotFoundError
from .base_singleton import SingletonMeta

logger = logging.getLogger(__name__)

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService(metaclass=SingletonMeta):

    async def register_user(
        self, db: AsyncSession, username: str, email: str, password: str
    ) -> tuple[User, str, str]:
        result = await db.execute(
            select(User).where((User.username == username) | (User.email == email))
        )
        if result.scalar_one_or_none():
            raise ConflictError("Username or email already exists")

        user = User(
            username=username,
            email=email,
            password_hash=_pwd_context.hash(password),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id, user.role.value)
        logger.info("User registered: %s", user.id)
        return user, access_token, refresh_token

    async def login_user(
        self, db: AsyncSession, email: str, password: str
    ) -> tuple[User, str, str]:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not user.password_hash:
            raise UnauthorizedError("Invalid email or password")
        if user.status.value == "BLOCKED":
            raise ForbiddenError("Account has been blocked")
        if not _pwd_context.verify(password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id, user.role.value)
        logger.info("User logged in: %s", user.id)
        return user, access_token, refresh_token

    async def request_password_reset(self, db: AsyncSession, email: str) -> dict:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            return {"message": "If the email exists, a reset link has been generated.", "reset_token": None}

        reset_token = create_password_reset_token(user.id)
        return {
            "message": "Password reset token generated. Integrate with email delivery in production.",
            "reset_token": reset_token,
            "expires_in_minutes": 60,
        }

    async def reset_password(self, db: AsyncSession, token: str, new_password: str) -> dict:
        payload = decode_password_reset_token(token)
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")

        user.password_hash = _pwd_context.hash(new_password)
        await db.commit()
        return {"message": "Password has been reset successfully"}

    async def change_password(
        self,
        db: AsyncSession,
        user_id: str,
        current_password: str,
        new_password: str,
    ) -> dict:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        if not user.password_hash or not _pwd_context.verify(current_password, user.password_hash):
            raise UnauthorizedError("Current password is incorrect")

        user.password_hash = _pwd_context.hash(new_password)
        await db.commit()
        return {"message": "Password changed successfully"}
