import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.middleware import PrometheusMiddleware
from api.routers import auth, users, tags, categories, documents, quizzes, community, teachers
from clients import Clients
from config.settings import Configs

logger = logging.getLogger(__name__)
cfg = Configs.app()


def _parse_allowed_origins(frontend_url: str) -> list[str]:
    if not frontend_url:
        return []
    return [origin.strip() for origin in frontend_url.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await Clients.startup()
    yield
    await Clients.close()


app = FastAPI(
    title=cfg.title,
    version=cfg.version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(PrometheusMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_allowed_origins(cfg.frontend_url),
    allow_origin_regex=cfg.frontend_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tags.router)
app.include_router(categories.router)
app.include_router(documents.router)
app.include_router(quizzes.router)
app.include_router(community.router)
app.include_router(teachers.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}


@app.get("/metrics", tags=["observability"])
async def metrics():
    try:
        from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
        from starlette.responses import Response

        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        return {"error": "prometheus_client not installed"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.api_main:app", host="0.0.0.0", port=cfg.port, reload=(cfg.environment != "production"))
