import logging
from sqlalchemy import text
from .databases import get_engine, get_session_factory

logger = logging.getLogger(__name__)


class Clients:
    @staticmethod
    async def startup() -> None:
        logger.info("Starting up clients...")
        engine = get_engine()
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database connection verified.")
        except Exception as exc:
            logger.warning("Database connection check failed (will retry on first request): %s", exc)

    @staticmethod
    async def close() -> None:
        logger.info("Closing clients...")
        engine = get_engine()
        await engine.dispose()
        logger.info("Database engine disposed.")
