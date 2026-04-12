import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger(__name__)

try:
    from prometheus_client import Counter, Histogram, REGISTRY

    _REQUEST_COUNT = Counter(
        "http_requests_total",
        "Total HTTP requests",
        ["method", "endpoint", "status_code"],
    )
    _REQUEST_LATENCY = Histogram(
        "http_request_duration_seconds",
        "HTTP request latency",
        ["method", "endpoint"],
    )
    _PROMETHEUS_AVAILABLE = True
except ImportError:
    _PROMETHEUS_AVAILABLE = False


class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start

        if _PROMETHEUS_AVAILABLE:
            endpoint = request.url.path
            _REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=response.status_code,
            ).inc()
            _REQUEST_LATENCY.labels(method=request.method, endpoint=endpoint).observe(duration)

        return response
