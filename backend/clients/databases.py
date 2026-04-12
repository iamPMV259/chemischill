import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from config.settings import Configs

logger = logging.getLogger(__name__)

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        url = Configs.database().url
        # Normalize scheme for asyncpg
        url = (
            url.replace("postgresql://", "postgresql+asyncpg://", 1)
               .replace("postgres://", "postgresql+asyncpg://", 1)
        )
        # Supabase (*.supabase.co) requires SSL
        connect_args = {}
        if "supabase.co" in url:
            import ssl as _ssl
            connect_args["ssl"] = _ssl.create_default_context()

        _engine = create_async_engine(
            url,
            pool_pre_ping=True,
            echo=False,
            connect_args=connect_args,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            expire_on_commit=False,
            class_=AsyncSession,
        )
    return _session_factory
