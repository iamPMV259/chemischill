import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from clients import Clients
from config.settings import Configs
from .middleware import PrometheusMiddleware

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await Clients.startup()
    yield
    await Clients.close()


app = FastAPI(
    title=Configs.app().title,
    version=Configs.app().version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(PrometheusMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[Configs.app().frontend_url],
    allow_origin_regex=Configs.app().frontend_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
