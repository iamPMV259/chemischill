import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from api import app
from api.routers import auth, users, tags, categories, documents, quizzes, community, teachers
from config.settings import Configs

logger = logging.getLogger(__name__)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tags.router)
app.include_router(categories.router)
app.include_router(documents.router)
app.include_router(quizzes.router)
app.include_router(community.router)
app.include_router(teachers.router)


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}


# ── Metrics ────────────────────────────────────────────────────────────────────
@app.get("/metrics", tags=["observability"])
async def metrics():
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        from starlette.responses import Response
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        return {"error": "prometheus_client not installed"}


# ── Global exception handler ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    cfg = Configs.app()
    uvicorn.run("api.api_main:app", host="0.0.0.0", port=cfg.port, reload=(cfg.environment != "production"))
