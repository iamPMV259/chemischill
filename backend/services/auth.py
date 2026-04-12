import logging
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import User
from utils.jwt import create_access_token, create_refresh_token
from hooks.error import UnauthorizedError, ConflictError, ForbiddenError
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
