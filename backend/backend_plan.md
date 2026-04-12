# ChemisChill Backend — Implementation Plan (Python)

## Context
Generate toàn bộ base code cho backend dựa theo `backend_guide.md`.
- File storage: **Supabase Storage** (documents PDF/DOC/DOCX) + **Cloudinary** (images)
- Deploy target: chỉ cần chạy local trước
- Stack: **Python 3.11+ + FastAPI + SQLAlchemy 2.x + Alembic + PostgreSQL**

## File Structure (41 files)

```
backend/
├── pyproject.toml          # dependencies
├── .env.example
├── .gitignore
├── alembic.ini
├── seed.py                 # seed data script
├── alembic/
│   ├── env.py
│   └── versions/           # migration files (generated)
└── app/
    ├── __init__.py
    ├── main.py             # FastAPI app + routers + middleware
    ├── config.py           # pydantic-settings
    ├── database.py         # SQLAlchemy engine + session
    ├── dependencies.py     # get_current_user, require_admin, get_optional_user
    ├── models/
    │   ├── __init__.py
    │   └── models.py       # tất cả SQLAlchemy models + Enums
    ├── schemas/            # Pydantic request/response schemas
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── user.py
    │   ├── tag.py
    │   ├── category.py
    │   ├── document.py
    │   ├── quiz.py
    │   └── community.py
    ├── services/           # business logic
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── users.py
    │   ├── tags.py
    │   ├── categories.py
    │   ├── documents.py
    │   ├── quizzes.py
    │   └── community.py    # + admin stats + upload endpoint logic
    ├── routers/            # FastAPI routers
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── users.py
    │   ├── tags.py
    │   ├── categories.py
    │   ├── documents.py
    │   ├── quizzes.py
    │   └── community.py    # + /admin/stats + /upload/image
    └── utils/
        ├── __init__.py
        ├── jwt.py          # create/decode access + refresh token
        ├── storage.py      # Cloudinary + Supabase helpers
        └── pagination.py   # paginate(), pagination_params()
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Python 3.11+ |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.x (sync, mapped_column style) |
| Migrations | Alembic |
| Database | PostgreSQL |
| Auth | JWT — python-jose + passlib[bcrypt] |
| Config | pydantic-settings |
| File (images) | Cloudinary SDK |
| File (docs) | Supabase Storage SDK |
| File upload | FastAPI UploadFile (multipart/form-data) |
| Rate limiting | slowapi |
| Validation | Pydantic v2 (built-in với FastAPI) |

## Key Design Decisions

| Decision | Choice |
|---|---|
| Token auth | Access 15min trả trong body, Refresh 7d httpOnly cookie |
| IDs | `uuid4()` dạng string |
| QuizSubmission | Không có unique constraint → cho phép retake |
| Password | bcrypt cost mặc định passlib |
| File upload | Đọc UploadFile bytes → upload thẳng lên Cloudinary/Supabase |
| Download | Supabase signed URL 5 phút, increment downloads counter |
| Quiz submit | Validate questionId + optionId thuộc quiz trước khi lưu |
| Community | Chỉ trả APPROVED cho public endpoints |
| Admin stats | Aggregate query từ DB, chart data placeholder 0 |

## Dependency Stack (`pyproject.toml`)

```
fastapi, uvicorn[standard]
sqlalchemy, alembic, psycopg2-binary
pydantic, pydantic-settings
python-jose[cryptography], passlib[bcrypt]
python-multipart
cloudinary
supabase
slowapi
python-dotenv
```

## Environment Variables

```env
PORT=8000
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/chemischill
JWT_SECRET=...                   (min 32 chars)
JWT_REFRESH_SECRET=...           (min 32 chars)
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=...
SUPABASE_STORAGE_BUCKET=chemischill-docs
```

## Running Locally

```bash
cd backend

# 1. Tạo virtualenv
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -e ".[dev]"

# 3. Điền env vars
cp .env.example .env

# 4. Tạo DB và chạy migrations
createdb chemischill   # hoặc qua psql
alembic revision --autogenerate -m "init"
alembic upgrade head

# 5. Seed dữ liệu mẫu
python seed.py

# 6. Chạy server
uvicorn app.main:app --reload --port 8000
# Docs tại: http://localhost:8000/docs
```

## API Endpoints (52 endpoints)

Tất cả endpoint giữ nguyên theo `backend_guide.md`, chỉ thay đổi implementation:
- TypeScript/Express → Python/FastAPI
- Prisma → SQLAlchemy + Alembic
- Multer → FastAPI `UploadFile`
- Zod → Pydantic v2
- cookie-parser → FastAPI `Cookie()` dependency
- express-rate-limit → slowapi

Xem `backend_guide.md` section 4 và 10 để biết đầy đủ danh sách endpoint.

## Modules và trách nhiệm

### `app/models/models.py`
Toàn bộ SQLAlchemy models với `Mapped` / `mapped_column` style (SQLAlchemy 2.0):
- `User`, `Category`, `Tag`
- `Document`, `DocumentTag`
- `Quiz`, `QuizTag`, `QuizQuestion`, `QuizOption`, `QuizSubmission`, `QuizSubmissionAnswer`
- `CommunityQuestion`, `CommunityQuestionImage`, `CommunityQuestionTag`
- `CommunityAnswer`, `CommunityAnswerImage`, `AnswerUpvote`
- Enums: `RoleEnum`, `UserStatusEnum`, `TagCategoryEnum`, `FileTypeEnum`, `DocumentStatusEnum`, `DifficultyEnum`, `QuestionStatusEnum`

### `app/dependencies.py`
- `get_current_user` — verify Bearer token, trả `User` object
- `get_optional_user` — same nhưng trả `None` nếu không có token
- `require_admin` — gọi `get_current_user` + kiểm tra `role == ADMIN`

### `app/utils/`
- `jwt.py` — `create_access_token`, `create_refresh_token`, `decode_access_token`, `decode_refresh_token`
- `storage.py` — `upload_to_cloudinary`, `delete_from_cloudinary`, `upload_to_supabase`, `delete_from_supabase`, `create_supabase_signed_url`
- `pagination.py` — `paginate(total, page, limit)`, `pagination_params(page, limit)`

### `app/services/community.py`
Gộp luôn logic cho:
- Community Q&A (list, detail, answers, upvote)
- Admin moderation (approve, reject, revision)
- Admin stats (`get_admin_stats`)
- Upload image (logic, router gọi trực tiếp `upload_to_cloudinary`)
