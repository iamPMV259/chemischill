import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from clients.databases import get_session_factory
from utils.jwt import decode_access_token
from database.models import User, UserStatusEnum, RoleEnum
from hooks.error import UnauthorizedError, ForbiddenError

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


async def get_db() -> AsyncSession:
    factory = get_session_factory()
    async with factory() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    try:
        payload = decode_access_token(credentials.credentials)
    except UnauthorizedError as e:
        raise HTTPException(status_code=401, detail=e.message)

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status == UserStatusEnum.BLOCKED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account has been blocked")

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        return result.scalar_one_or_none()
    except Exception:
        return None


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
