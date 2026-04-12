# CLAUDE.md

## Mục tiêu

Tài liệu này tổng hợp form, structure và coding style đang lặp lại nhiều nhất trong các Python service của repo này để dùng làm chuẩn khi tạo service mới.

Các service đã đọc để rút pattern:

- `agent_tools`
- `internet_search`
- `chatbot/src`
- `telegram_service`
- `user_management`
- `signal_websocket`
- `model_service`
- `contractor`
- có đối chiếu thêm với `rag_flow/src` ở mức cấu trúc thư mục

Nguyên tắc của tài liệu này:

- ưu tiên pattern xuất hiện lặp lại ở nhiều service
- coi các chỗ chưa đồng nhất là “existing variance”, không mặc định copy nguyên xi
- khi tạo service mới, follow phần “Nên làm” thay vì copy phần cũ kém nhất quán

## 1. Form service chuẩn trong repo này

Một service Python trong repo thường có cấu trúc gần như sau:

```text
service_name/
  api/
    __init__.py
    api_main.py hoặc app.py
    config.py
    middleware.py
    utils.py
    models.py
    auth.py hoặc dependencies.py
    routers/ hoặc rest_routes.py
  clients/
    __init__.py
    http.py hoặc aiohttp.py
    services.py
    databases.py
    client_manager.py
  config/
    __init__.py
    app.py
    auth.py
    settings.py
    models.py
    service_config.py hoặc services.py
    db_config.py hoặc database_config.py
  services/
    __init__.py
    base_singleton.py
    http_request.py hoặc http_service.py
    <domain_service>.py
  hooks/
    error.py hoặc errors.py
  database/ hoặc databases/
  utils/
  Dockerfile
  compose.yaml
  compose-stack.yaml
  run.sh
  pyproject.toml
  app-config-template.yaml
```

Không phải service nào cũng có đủ mọi thư mục, nhưng nếu là microservice HTTP chuẩn thì cấu trúc trên là form nên giữ.

## 2. Layout layer và trách nhiệm

### `config/`

Chứa toàn bộ cấu hình typed bằng Pydantic.

Pattern chung:

- `config/__init__.py`:
  - `load_dotenv()`
  - đọc `app-config.yaml`
  - expand biến môi trường bằng `os.path.expandvars`
  - parse YAML
  - validate qua `RootConfig`
  - export `root_config`
- `config/models.py`:
  - định nghĩa schema tổng cho YAML config
- `config/app.py`, `config/auth.py`, `config/service_config.py`, `config/db_config.py`:
  - bóc từng phần từ `root_config` thành object nhỏ hơn
- `config/settings.py`:
  - tạo singleton config object ở module level
  - expose qua class `Configs` với các `@staticmethod`

Đây là pattern xuất hiện lặp lại ở `chatbot`, `internet_search`, `telegram_service`, `user_management`, `contractor`, `signal_websocket`, `model_service`.

### `api/`

Chứa FastAPI app và route public.

Pattern chung:

- `api/__init__.py`:
  - tạo `FastAPI(...)`
  - khai báo `lifespan`
  - add CORS nếu service public
  - add `PrometheusMiddleware`
  - setup OpenTelemetry qua `setup_observability(...)`
  - instrument logging / aiohttp client
- `api/api_main.py` hoặc `api/app.py`:
  - import `app` từ `api.__init__`
  - include router hoặc định nghĩa route trực tiếp
  - luôn có `/health`
  - thường có `/metrics`
  - block `if __name__ == "__main__": uvicorn.run(...)`
- `api/models.py`:
  - request/response schema cho API
- `api/auth.py` hoặc `api/dependencies.py`:
  - verify API key / bearer / JWT
- `api/middleware.py`:
  - Prometheus request metrics middleware

### `clients/`

Chứa factory/client dùng để gọi ra ngoài.

Pattern chung:

- `clients/__init__.py`:
  - gom singleton cho DB client, HTTP client, service client
  - có `startup()` và `close()`
  - đôi khi export shortcut như `redis_client`, `user_management_client`
- `clients/http.py` hoặc `clients/aiohttp.py`:
  - low-level HTTP transport
- `clients/services.py`:
  - khởi tạo wrapper class ở `services/`
- `clients/databases.py`:
  - khởi tạo Redis/Mongo/Qdrant...
- `clients/client_manager.py`:
  - có ở service lớn như `chatbot`, gom nhiều dependency hơn

### `services/`

Chứa domain service hoặc wrapper cho external/internal service.

Pattern chung:

- `services/base_singleton.py`:
  - metaclass `SingletonMeta`, thread-safe
- `services/http_request.py` hoặc `services/utils.py`:
  - generic HTTP wrapper, retry, timeout, normalize params
- `services/<name>.py`:
  - class wrapper có `url`, `headers`, `http_client`
  - private `_async_request()` / `_sync_request()`
  - public methods map 1-1 với use case nghiệp vụ
  - parse response về Pydantic schema hoặc dict có kiểm soát

### `hooks/`

Chứa custom exception dùng xuyên suốt service.

Pattern chung:

- `BaseAppException` hoặc exception phân tầng rõ theo HTTP meaning
- route map exception sang `HTTPException`
- service wrapper translate lỗi HTTP client thành domain exception

## 3. Cách wiring dependency đang được dùng

Pattern phổ biến nhất:

1. `config` load YAML một lần khi import.
2. `settings.py` tạo config singleton.
3. `clients/__init__.py` tạo lazy singleton cho transport/service/database client.
4. `api.__init__.py` gọi `Clients.startup()` trong lifespan.
5. route gọi `services` hoặc backend logic.
6. khi shutdown, `Clients.close()`.

Điều này nghĩa là service mới nên:

- không new client lung tung trong route
- không đọc file config trực tiếp trong business code
- không để route tự dựng URL/header của service khác

## 4. Style config chuẩn nên follow

### Nguồn config

Service trong repo đang dùng:

- file `app-config.yaml`
- template mẫu là `app-config-template.yaml`
- `.env` để inject secret/URL qua `${VAR_NAME}`

### Cách model config

Nên giữ:

- `RootConfig` là schema gốc cho toàn YAML
- mỗi nhóm config có model riêng:
  - `AppConfig`
  - `AuthConfig`
  - `ServiceConfig` / `ServicesConfig`
  - `RedisConfig`, `MongoConfig`, `QdrantConfig`...
- `config/settings.py` chỉ expose getter, không nhét logic nghiệp vụ

### Shape config lặp lại nhiều nhất

```yaml
authentication:
services:
database:
app:
```

Không phải service nào cũng có đủ 4 block, nhưng service mới nên giữ shape này nếu phù hợp.

## 5. Style API/FastAPI chuẩn nên follow

### App bootstrap

Nên có:

- `FastAPI(root_path=app_config.PROXY_ROOT_PATH, ...)`
- `lifespan` để startup/close client
- `/health`
- `/metrics`
- `PrometheusMiddleware`
- `setup_observability(...)`

### Route style

Pattern đang dùng:

- annotate kiểu trả về rõ
- gắn `status_code=...`
- dùng `response_model=...` khi response có schema ổn định
- dùng `tags=[...]` từ `api.config.Configs`
- endpoint có docstring khá dài, mô tả args/returns/raises

### Error handling

Nên follow flow này:

1. tầng client/service raise domain exception.
2. tầng route convert sang `HTTPException`.
3. log `warning` cho lỗi expected, `exception/error` cho lỗi unexpected.

Không nên:

- bắt `Exception` quá sớm rồi nuốt lỗi
- để route vừa validate business rule vừa tự call HTTP low-level

## 6. Style `clients` và `services` chuẩn nên follow

### HTTP wrapper

Pattern lặp lại ở nhiều service:

- enum `RequestMethod` / `HTTPMethod`
- support sync + async request
- `aiohttp.ClientSession` được startup riêng
- timeout mặc định
- retry bằng exponential backoff
- normalize boolean/query params trước khi gửi

### Service wrapper

Mẫu thực tế trong repo:

- constructor nhận `url`, secret key, `http_client`
- build `headers` sẵn từ constructor
- define enum cho endpoint suffix nếu service có nhiều endpoint
- private `_async_request()` xử lý error mapping
- public method trả về Pydantic schema hoặc list/dict đã chuẩn hóa

Đây là style đang rõ nhất ở:

- `chatbot/src/services/user_management.py`
- `telegram_service/services/user_management.py`
- `agent_tools/services/entity.py`
- `contractor/services/http_service.py`

### Singleton

Repo đang dùng `SingletonMeta` khá nhiều. Với service mới:

- dùng singleton cho HTTP client, DB client, service client
- không lạm dụng singleton cho object nghiệp vụ thuần stateless nếu không cần

## 7. Naming convention đang lặp lại

### Tên file

- `api_main.py` hoặc `app.py` cho entrypoint FastAPI
- `settings.py` cho getter config
- `service_config.py` hoặc `services.py` cho URL/API key của service khác
- `db_config.py` hoặc `database_config.py` cho DB
- `base_singleton.py` cho singleton metaclass
- `http_request.py` / `http_service.py` cho HTTP abstraction

### Tên class

- config model: `AppConfig`, `AuthConfig`, `ServicesConfig`, `RedisConfig`
- service wrapper: `UserManager`, `MainBot`, `EntityService`, `SearchService`
- schema: `UserInfoSchema`, `ChatbotSchema`, `SearchResponse`
- enum endpoint: `EndpointSuffix`, `_Endpoint`
- factory container: `Clients`, `ServiceClient`, `DatabaseClient`

### Tên biến

Pattern phổ biến:

- config singleton ở module level: `app_config`, `auth_config`, `service_config`
- logger module level: `logger = logging.getLogger(__name__)`
- constants UPPER_CASE cho config/static endpoint
- request params/payload dùng kiểu `params`, `json`, `payload`

## 8. Cách code đang được ưa dùng

### Pydantic-first

Repo này thiên về:

- parse config bằng Pydantic
- parse request/response schema bằng Pydantic
- dùng enum cho giá trị hữu hạn

Khi tạo service mới, ưu tiên:

- không truyền dict raw xuyên nhiều layer nếu có schema rõ
- normalize response sớm về model

### Async-first

Đa số service I/O dùng async:

- FastAPI route `async def`
- HTTP client async
- startup/shutdown async
- WebSocket service async

Nếu không có lý do rõ ràng, service mới nên theo async-first.

### Logging

Pattern chung:

- `logging.getLogger(__name__)`
- log trước khi gọi external/internal service
- log message có URL/params vừa đủ để trace
- uvicorn access log gắn trace/span id qua custom logging format

### Observability

Gần như service nào cũng có hoặc đang hướng tới:

- Prometheus metrics
- OpenTelemetry tracing
- Tempo exporter

Service mới nên coi observability là mặc định, không phải optional add-on.

## 9. Chỗ chưa đồng nhất trong codebase hiện tại

Khi đọc repo, có vài khác biệt cần biết để tránh copy nhầm:

- version Python chưa thống nhất:
  - `agent_tools`, `internet_search`: `>=3.10`
  - `telegram_service`: `>=3.11`
  - `chatbot/src`: `>=3.12`
- tên file config chưa đồng nhất:
  - `service_config.py`, `services.py`
  - `db_config.py`, `database_config.py`
  - `config/` và `configs/`
- entrypoint API chưa đồng nhất:
  - nơi dùng `api_main.py`
  - nơi dùng `app.py`
- có service còn duplicate setup observability hoặc còn route xử lý business khá dày

Vì vậy khi làm service mới, nên chuẩn hóa theo bộ sau:

- Python 3.11+ nếu không bị ràng buộc
- dùng thư mục `config/`, không dùng `configs/`
- dùng `api/__init__.py` + `api/api_main.py`
- dùng `service_config.py` và `db_config.py`
- chỉ setup observability một lần trong app bootstrap

## 10. Blueprint đề xuất cho service mới

Nếu tạo service mới trong repo này, nên scaffold như sau:

### Bắt buộc

- `pyproject.toml`
- `app-config-template.yaml`
- `config/__init__.py`
- `config/models.py`
- `config/app.py`
- `config/settings.py`
- `api/__init__.py`
- `api/api_main.py`
- `api/models.py`
- `api/middleware.py`
- `clients/__init__.py`
- `services/base_singleton.py`
- `services/http_request.py`
- `Dockerfile`
- `compose.yaml`
- `compose-stack.yaml`
- `run.sh`

### Nếu service gọi service khác

Thêm:

- `config/service_config.py`
- `clients/services.py`
- `services/<target_service>.py`

### Nếu service có DB

Thêm:

- `config/db_config.py`
- `clients/databases.py`
- `database/` hoặc `databases/`

## 11. Coding checklist khi viết service mới

- Load config qua `app-config.yaml`, không hard-code URL/secret trong code.
- Mọi config phải có Pydantic model.
- Tạo `Configs` getter trong `config/settings.py`.
- App phải có `lifespan`, `/health`, `/metrics`.
- Dùng `Clients.startup()` và `Clients.close()`.
- External/internal calls phải đi qua service wrapper, không gọi raw HTTP trong route.
- Error từ service wrapper phải map sang custom exception rõ nghĩa.
- Route chỉ nên orchestration và HTTP mapping.
- Dùng enum và schema thay vì magic string/dict raw nếu shape ổn định.
- Logging phải đủ để debug request flow.
- Có `app-config-template.yaml`, `compose.yaml`, `compose-stack.yaml`, `run.sh`.

## 12. “Form” ngắn gọn để copy khi thêm service mới

Nếu cần một mental model ngắn gọn, hãy follow công thức này:

1. `config` đọc YAML + env, trả ra typed config singleton.
2. `clients` tạo lazy singleton cho HTTP/DB/service client.
3. `services` bọc mọi dependency ngoài và business integration.
4. `api` chỉ expose FastAPI endpoint, auth, middleware, health/metrics.
5. `hooks/error.py` giữ custom exception chung.
6. `compose` + `Dockerfile` + `run.sh` luôn đi kèm service.

## 13. Kết luận

Style service của repo này là microservice Python theo hướng:

- config-driven
- Pydantic-first
- async-first
- FastAPI + lifespan
- dependency wiring qua singleton factories
- observability mặc định
- service-to-service communication qua wrapper class

Khi tạo service mới, hãy ưu tiên đồng nhất với các pattern trên thay vì copy nguyên một service bất kỳ, vì codebase hiện tại có vài khác biệt lịch sử giữa các service.
