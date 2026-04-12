# ChemisChill — Backend Implementation Guide

---

## 1. Tech Stack

| Layer | Technology | Lý do chọn |
|---|---|---|
| Runtime | Python 3.11+ | Ecosystem mạnh, phù hợp với team |
| Framework | FastAPI | Async-ready, auto Swagger docs, type hints native |
| Language | Python | Đơn giản, dễ onboard |
| ORM | SQLAlchemy 2.x | ORM mạnh nhất Python, Mapped style type-safe |
| Migrations | Alembic | Autogenerate migrations từ SQLAlchemy models |
| Database | PostgreSQL 16+ | Relational, phù hợp data model phức tạp |
| Auth | JWT (access + refresh token) | python-jose + passlib[bcrypt] |
| File storage (docs) | Supabase Storage | Lưu PDF/DOC/DOCX lớn, free 1GB |
| File storage (images) | Cloudinary | Resize/optimize ảnh tự động, free tier ổn |
| Validation | Pydantic v2 | Native với FastAPI, type-safe |
| File upload | FastAPI UploadFile | Built-in, đọc bytes → upload thẳng lên cloud |
| Config | pydantic-settings | Validate env vars với type hints |
| Rate limiting | slowapi | Decorator-based, tích hợp tốt với FastAPI |

> **Lưu ý về Auth:** Frontend hiện dùng email + password mock. MVP có thể giữ email/password trước, sau này migrate sang phone OTP (Twilio hoặc ESMS.vn cho số VN).

---

## 2. Project Structure

```
backend/
├── pyproject.toml              # Dependencies + build config
├── .env.example
├── .gitignore
├── alembic.ini                 # Alembic config
├── seed.py                     # Seed script: tags, categories, admin
├── alembic/
│   ├── env.py                  # Alembic env (load settings, target_metadata)
│   └── versions/               # Migration files (auto-generated)
└── app/
    ├── __init__.py
    ├── main.py                 # FastAPI app, CORS, routers, exception handler
    ├── config.py               # pydantic-settings (validate env vars)
    ├── database.py             # SQLAlchemy engine + SessionLocal + get_db
    ├── dependencies.py         # get_current_user, get_optional_user, require_admin
    ├── models/
    │   ├── __init__.py
    │   └── models.py           # Tất cả SQLAlchemy models + Enums
    ├── schemas/                # Pydantic v2 request/response schemas
    │   ├── auth.py
    │   ├── user.py
    │   ├── tag.py
    │   ├── category.py
    │   ├── document.py
    │   ├── quiz.py
    │   └── community.py
    ├── services/               # Business logic (DB queries, file upload, etc.)
    │   ├── auth.py
    │   ├── users.py
    │   ├── tags.py
    │   ├── categories.py
    │   ├── documents.py
    │   ├── quizzes.py
    │   └── community.py        # Gồm cả admin stats
    ├── routers/                # FastAPI routers
    │   ├── auth.py
    │   ├── users.py
    │   ├── tags.py
    │   ├── categories.py
    │   ├── documents.py
    │   ├── quizzes.py
    │   └── community.py        # Gồm cả /admin/stats và /upload/image
    └── utils/
        ├── jwt.py              # create/decode access + refresh token
        ├── storage.py          # Cloudinary + Supabase helpers
        └── pagination.py       # paginate(), pagination_params()
```

---

## 3. Database Design — SQLAlchemy Models

File: `app/models/models.py`

```python
# ─── Enums ────────────────────────────────────────────────────────────────────
class RoleEnum(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class UserStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    BLOCKED = "BLOCKED"

class TagCategoryEnum(str, enum.Enum):
    TOPIC = "TOPIC"
    GRADE = "GRADE"
    DIFFICULTY = "DIFFICULTY"

class FileTypeEnum(str, enum.Enum):
    PDF = "PDF"
    DOC = "DOC"
    DOCX = "DOCX"
    IMAGE = "IMAGE"

class DocumentStatusEnum(str, enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    DRAFT = "DRAFT"

class DifficultyEnum(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class QuestionStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"

# ─── Models ───────────────────────────────────────────────────────────────────
# User, Category, Tag, Document, DocumentTag
# Quiz, QuizTag, QuizQuestion, QuizOption, QuizSubmission, QuizSubmissionAnswer
# CommunityQuestion, CommunityQuestionImage, CommunityQuestionTag
# CommunityAnswer, CommunityAnswerImage, AnswerUpvote
```

> Xem file `app/models/models.py` để biết đầy đủ field definitions.
> IDs dùng `uuid4()` dạng string thay vì cuid.
> `QuizSubmission` **không** có unique constraint `(user_id, quiz_id)` — cho phép retake.

### Lệnh tạo migration và sync DB

```bash
# Autogenerate migration từ models
alembic revision --autogenerate -m "init"

# Chạy migration
alembic upgrade head

# Downgrade nếu cần
alembic downgrade -1
```

### Naming convention (snake_case thay vì camelCase)

| Prisma field | SQLAlchemy column |
|---|---|
| `passwordHash` | `password_hash` |
| `avatarUrl` | `avatar_url` |
| `uploadedById` | `uploaded_by_id` |
| `allowDownload` | `allow_download` |
| `isPublished` | `is_published` |
| `createdAt` | `created_at` |

> API response vẫn trả về **snake_case** (không cần alias).
> Frontend cần map nếu đang dùng camelCase.

### Enums (vẫn giữ nguyên giá trị string)

```
enum Difficulty {

model Quiz {
  id                String     @id @default(cuid())
  title             String
  description       String
  topic             String?
  timeLimit         Int        // phút
  difficulty        Difficulty @default(MEDIUM)
  isPublished       Boolean    @default(false)
  hasReward         Boolean    @default(false)
  rewardDescription String?
  participantsCount Int        @default(0)
  createdById       String
  createdBy         User       @relation(fields: [createdById], references: [id])
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  questions   QuizQuestion[]
  submissions QuizSubmission[]
  tags        QuizTag[]
}

model QuizTag {
  quizId String
  tagId  String
  quiz   Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([quizId, tagId])
}

model QuizQuestion {
  id               String       @id @default(cuid())
  quizId           String
  quiz             Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  questionText     String
  questionImageUrl String?
  explanation      String?
  orderIndex       Int          @default(0)
  createdAt        DateTime     @default(now())

  options           QuizOption[]
  submissionAnswers QuizSubmissionAnswer[]
}

model QuizOption {
  id         String       @id @default(cuid())
  questionId String
  question   QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  optionText String
  isCorrect  Boolean      @default(false)
  orderIndex Int          @default(0)

  submissionAnswers QuizSubmissionAnswer[]
}

model QuizSubmission {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  quizId         String
  quiz           Quiz     @relation(fields: [quizId], references: [id])
  score          Int      // số câu đúng
  totalQuestions Int
  timeTakenSecs  Int?
  submittedAt    DateTime @default(now())

  answers QuizSubmissionAnswer[]

  @@unique([userId, quizId])
}

model QuizSubmissionAnswer {
  id               String         @id @default(cuid())
  submissionId     String
  submission       QuizSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  questionId       String
  question         QuizQuestion   @relation(fields: [questionId], references: [id])
  selectedOptionId String?
  selectedOption   QuizOption?    @relation(fields: [selectedOptionId], references: [id])
  isCorrect        Boolean
}

// ─── COMMUNITY Q&A ────────────────────────────────────────────────────────

enum QuestionStatus {
  PENDING
  APPROVED
  REJECTED
  REVISION_REQUESTED
}

model CommunityQuestion {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id])
  title        String
  content      String
  status       QuestionStatus @default(PENDING)
  adminNote    String?
  reviewedById String?
  reviewedBy   User?          @relation("ReviewedBy", fields: [reviewedById], references: [id])
  reviewedAt   DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  images  CommunityQuestionImage[]
  answers CommunityAnswer[]
  tags    CommunityQuestionTag[]
}

model CommunityQuestionImage {
  id         String            @id @default(cuid())
  questionId String
  question   CommunityQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  imageUrl   String
  imageKey   String
  orderIndex Int               @default(0)
}

model CommunityQuestionTag {
  questionId String
  tagId      String
  question   CommunityQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag        Tag               @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([questionId, tagId])
}

model CommunityAnswer {
  id         String            @id @default(cuid())
  questionId String
  question   CommunityQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userId     String
  user       User              @relation(fields: [userId], references: [id])
  content    String
  upvotes    Int               @default(0)
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  images    CommunityAnswerImage[]
  upvotedBy AnswerUpvote[]
}

model CommunityAnswerImage {
  id         String          @id @default(cuid())
  answerId   String
  answer     CommunityAnswer @relation(fields: [answerId], references: [id], onDelete: Cascade)
  imageUrl   String
  imageKey   String
  orderIndex Int             @default(0)
}

model AnswerUpvote {
  userId    String
  answerId  String
  user      User            @relation(fields: [userId], references: [id])
  answer    CommunityAnswer @relation(fields: [answerId], references: [id], onDelete: Cascade)
  createdAt DateTime        @default(now())

  @@id([userId, answerId])
}
```

---

## 4. API Endpoints — Đầy đủ theo từng nút UI

### Convention
- `[Public]` — không cần đăng nhập
- `[Auth]` — cần JWT access token (`Authorization: Bearer <token>`)
- `[Admin]` — cần JWT + role ADMIN

---

### 4.1 Authentication

#### POST `/auth/register`
**Nút:** "Register" ở RegisterPage
**Auth:** Public

**Request body:**
```json
{
  "username": "nguyenminh",
  "email": "nguyenminh@gmail.com",
  "password": "securepassword123"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "clx...",
    "username": "nguyenminh",
    "email": "nguyenminh@gmail.com",
    "fullName": null,
    "avatarUrl": null,
    "role": "USER"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Response 409:** `{ "error": "Username or email already exists" }`

---

#### POST `/auth/login`
**Nút:** "Login" ở LoginPage
**Auth:** Public

**Request body:**
```json
{
  "email": "nguyenminh@gmail.com",
  "password": "securepassword123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "clx...",
    "username": "nguyenminh",
    "email": "nguyenminh@gmail.com",
    "fullName": "Nguyễn Minh",
    "avatarUrl": "https://res.cloudinary.com/...",
    "role": "USER"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```
> `refreshToken` được set vào httpOnly cookie. `accessToken` trả trong body để frontend lưu vào memory.

**Response 401:** `{ "error": "Invalid email or password" }`

---

#### POST `/auth/logout`
**Nút:** "Đăng xuất" ở UserLayout header dropdown
**Auth:** Auth

**Response 200:** `{ "message": "Logged out" }`
> Xóa refresh token cookie phía server.

---

#### POST `/auth/refresh`
**Nút:** Tự động gọi khi access token hết hạn (interceptor)
**Auth:** Public (gửi refreshToken qua httpOnly cookie)

**Response 200:**
```json
{
  "accessToken": "eyJ..."
}
```

**Response 401:** `{ "error": "Refresh token invalid or expired" }`

---

### 4.2 Users

#### GET `/users/me`
**Nút:** Tự động khi load UserProfilePage, EditProfilePage
**Auth:** Auth

**Response 200:**
```json
{
  "id": "clx...",
  "username": "nguyenminh",
  "email": "nguyenminh@gmail.com",
  "fullName": "Nguyễn Minh",
  "avatarUrl": "https://res.cloudinary.com/...",
  "phone": "0901234567",
  "birthYear": 2005,
  "school": "THPT Chuyên Lê Hồng Phong",
  "role": "USER",
  "createdAt": "2026-01-01T00:00:00Z",
  "stats": {
    "rank": 3,
    "points": 2290,
    "quizzesCompleted": 38,
    "questionsPosted": 15
  }
}
```

---

#### PATCH `/users/me`
**Nút:** "Save" ở EditProfilePage
**Auth:** Auth

**Request body (JSON, tất cả fields optional):**
```json
{
  "fullName": "Nguyễn Minh",
  "phone": "0901234567",
  "birthYear": 2005,
  "school": "THPT Chuyên Lê Hồng Phong"
}
```

**Response 200:** trả về user object đã cập nhật (giống GET /users/me)

---

#### POST `/users/me/avatar`
**Nút:** Upload ảnh đại diện ở EditProfilePage
**Auth:** Auth
**Content-Type:** `multipart/form-data`

**Form fields:**
```
avatar: (binary file, max 2MB, JPG/PNG/WEBP)
```

**Response 200:**
```json
{
  "avatarUrl": "https://res.cloudinary.com/chemischill/image/upload/avatars/clx..."
}
```

---

#### GET `/users/:id`
**Nút:** Click vào user card ở HomePage leaderboard, LeaderboardPage
**Auth:** Public

**Response 200:**
```json
{
  "id": "clx...",
  "username": "nguyenminh",
  "fullName": "Nguyễn Minh",
  "avatarUrl": "...",
  "school": "THPT Chuyên Lê Hồng Phong",
  "createdAt": "2026-01-01T00:00:00Z",
  "stats": {
    "rank": 3,
    "points": 2290,
    "quizzesCompleted": 38,
    "questionsPosted": 15
  }
}
```
> Không trả email, phone, role (bảo mật).

---

#### GET `/leaderboard`
**Nút:** Tự động khi load LeaderboardPage, AdminLeaderboardPage, HomePage
**Auth:** Public

**Query params:**
```
?period=all-time   # all-time | weekly | monthly
&limit=50
```

**Response 200:**
```json
{
  "period": "all-time",
  "data": [
    {
      "rank": 1,
      "userId": "clx...",
      "username": "nguyenvanan",
      "fullName": "Nguyễn Văn An",
      "avatarUrl": "...",
      "quizzesCompleted": 45,
      "totalScore": 2450,
      "questionsPosted": 12
    }
  ],
  "summary": {
    "totalActiveUsers": 156,
    "totalQuizParticipations": 892,
    "totalQuestionsPosted": 110
  }
}
```

---

#### GET `/admin/users`
**Nút:** Tự động khi load AdminUsersPage
**Auth:** Admin

**Query params:**
```
?search=keyword   # tìm theo username, fullName, phone
&status=ACTIVE    # ACTIVE | BLOCKED
&page=1
&limit=20
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "username": "...",
      "fullName": "...",
      "email": "...",
      "phone": "...",
      "avatarUrl": "...",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "...",
      "stats": {
        "quizzesCompleted": 23,
        "questionsPosted": 6,
        "points": 1620
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 156, "totalPages": 8 }
}
```

---

#### PATCH `/admin/users/:id/status`
**Nút:** Nút "Ban" (block) và khôi phục ở AdminUsersPage
**Auth:** Admin

**Request body:**
```json
{
  "status": "BLOCKED"
}
```
hoặc:
```json
{
  "status": "ACTIVE"
}
```

**Response 200:**
```json
{
  "id": "clx...",
  "status": "BLOCKED"
}
```

---

### 4.3 Tags

#### GET `/tags`
**Nút:** Tự động khi load DocumentLibraryPage, PostQuestionPage, AdminUploadDocumentPage, AdminCreateQuizPage, AdminEditQuizPage, AdminEditDocumentPage
**Auth:** Public

**Response 200:**
```json
{
  "data": [
    { "id": "clx...", "name": "Organic Chemistry", "category": "TOPIC" },
    { "id": "clx...", "name": "Grade 12", "category": "GRADE" },
    { "id": "clx...", "name": "Advanced Exercises", "category": "DIFFICULTY" }
  ]
}
```

---

#### POST `/admin/tags`
**Nút:** "Add Tag" ở AdminTagsPage
**Auth:** Admin

**Request body:**
```json
{
  "name": "Thermochemistry",
  "category": "TOPIC"
}
```

**Response 201:**
```json
{
  "id": "clx...",
  "name": "Thermochemistry",
  "category": "TOPIC",
  "createdAt": "..."
}
```

**Response 409:** `{ "error": "Tag name already exists" }`

---

#### PATCH `/admin/tags/:id`
**Nút:** "Edit" ở AdminTagsPage
**Auth:** Admin

**Request body:**
```json
{
  "name": "Thermochemistry Updated",
  "category": "TOPIC"
}
```

**Response 200:** trả về tag đã cập nhật

---

#### DELETE `/admin/tags/:id`
**Nút:** "Delete" ở AdminTagsPage
**Auth:** Admin

**Response 200:** `{ "message": "Tag deleted" }`

> Xóa tag cũng xóa các join rows trong DocumentTag, QuizTag, CommunityQuestionTag (cascade).

---

### 4.4 Categories

#### GET `/categories`
**Nút:** Tự động khi load DocumentLibraryPage (filter), AdminUploadDocumentPage, AdminEditDocumentPage, AdminCategoriesPage
**Auth:** Public

**Query params:**
```
?parentId=<id>   # lấy subcategories của một category (bỏ trống để lấy top-level)
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "nameVi": "Hóa Hữu Cơ",
      "nameEn": "Organic Chemistry",
      "slug": "organic",
      "parentId": null,
      "children": [
        { "id": "clx...", "nameVi": "Phản Ứng Hữu Cơ", "nameEn": "Organic Reactions", "slug": "organic-reactions" }
      ]
    }
  ]
}
```

---

#### POST `/admin/categories`
**Nút:** "Add Category" ở AdminCategoriesPage
**Auth:** Admin

**Request body:**
```json
{
  "nameVi": "Hóa Phân Tích",
  "nameEn": "Analytical Chemistry",
  "slug": "analytical",
  "parentId": null
}
```

**Response 201:** trả về category mới

---

#### PATCH `/admin/categories/:id`
**Nút:** "Edit" ở AdminCategoriesPage
**Auth:** Admin

**Request body (fields optional):**
```json
{
  "nameVi": "Hóa Phân Tích",
  "nameEn": "Analytical Chemistry"
}
```

**Response 200:** trả về category đã cập nhật

---

#### DELETE `/admin/categories/:id`
**Nút:** "Delete" ở AdminCategoriesPage
**Auth:** Admin

**Response 200:** `{ "message": "Category deleted" }`

> Nếu category có documents, set `categoryId = null` cho các documents đó trước khi xóa.

---

### 4.5 Documents

#### GET `/documents`
**Nút:** Tự động khi load DocumentLibraryPage, tìm kiếm, filter tag
**Auth:** Public

**Query params:**
```
?search=ester
&tagIds=clx1,clx2
&categoryId=organic
&featured=true
&page=1
&limit=12
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Summary of Common Ester Reactions",
      "description": "...",
      "thumbnailUrl": "...",
      "fileType": "PDF",
      "allowDownload": true,
      "featured": true,
      "status": "PUBLIC",
      "views": 1243,
      "downloads": 856,
      "createdAt": "2026-03-15T00:00:00Z",
      "tags": [
        { "id": "clx...", "name": "Ester", "category": "TOPIC" }
      ],
      "category": { "id": "clx...", "nameVi": "Hóa Hữu Cơ", "nameEn": "Organic Chemistry" }
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
}
```

---

#### GET `/documents/featured`
**Nút:** Tự động khi load HomePage (featured documents section)
**Auth:** Public

**Response 200:**
```json
{
  "data": [ ...same format as /documents... ]
}
```
> Trả tối đa 6 documents có `featured = true, status = PUBLIC`, sorted by `createdAt DESC`.

---

#### GET `/documents/:id`
**Nút:** Click vào document card → load DocumentDetailPage
**Auth:** Public

**Response 200:**
```json
{
  "id": "clx...",
  "title": "...",
  "description": "...",
  "thumbnailUrl": "...",
  "fileType": "PDF",
  "fileSizeBytes": 2048000,
  "allowDownload": true,
  "featured": true,
  "status": "PUBLIC",
  "views": 1244,
  "downloads": 856,
  "createdAt": "...",
  "uploadedBy": {
    "id": "clx...",
    "username": "admin",
    "fullName": "Admin"
  },
  "tags": [...],
  "category": {...},
  "relatedDocuments": [
    {
      "id": "clx...",
      "title": "...",
      "thumbnailUrl": "...",
      "downloads": 987
    }
  ]
}
```

---

#### POST `/documents/:id/view`
**Nút:** Tự động khi DocumentDetailPage mount (increment view counter)
**Auth:** Public

**Response 200:** `{ "views": 1244 }`

> Gọi ngay khi user mở trang document. Có thể debounce bằng cách check sessionStorage ở frontend trước khi gọi.

---

#### GET `/documents/:id/download`
**Nút:** "Tải Xuống Tài Liệu" ở DocumentDetailPage, "Download" ở UserProfilePage tab downloads
**Auth:** Auth

**Response 200:**
```json
{
  "downloadUrl": "https://storage.supabase.co/.../signed-url?token=...&expires=300",
  "filename": "ester-reactions-summary.pdf",
  "fileType": "PDF"
}
```

**Response 403:** `{ "error": "Download not allowed for this document" }`
**Response 401:** `{ "error": "Login required to download" }`

> Backend kiểm tra `document.allowDownload === true`, tạo signed URL hết hạn sau 5 phút, increment `downloads += 1`.

---

#### POST `/admin/documents`
**Nút:** "Publish Document" và "Save as Draft" ở AdminUploadDocumentPage
**Auth:** Admin
**Content-Type:** `multipart/form-data`

**Form fields:**
```
file:          (binary, required, max 50MB, PDF/DOC/DOCX)
thumbnail:     (binary, optional, max 2MB, JPG/PNG/WEBP)
title:         string (required)
description:   string (required)
tagIds:        JSON string array, e.g. '["clx1","clx2"]'
categoryId:    string (optional)
featured:      "true" | "false"
allowDownload: "true" | "false"
status:        "PUBLIC" | "PRIVATE" | "DRAFT"
```

**Response 201:**
```json
{
  "id": "clx...",
  "title": "...",
  "status": "PUBLIC",
  "fileUrl": "...",
  "thumbnailUrl": "..."
}
```

---

#### PATCH `/admin/documents/:id`
**Nút:** "Save Changes" ở AdminEditDocumentPage
**Auth:** Admin
**Content-Type:** `multipart/form-data` (file fields optional)

**Form fields (tất cả optional, chỉ gửi fields muốn update):**
```
file:          (binary, optional - thay file mới)
thumbnail:     (binary, optional - thay thumbnail mới)
title:         string
description:   string
tagIds:        JSON string array
categoryId:    string
featured:      "true" | "false"
allowDownload: "true" | "false"
status:        "PUBLIC" | "PRIVATE" | "DRAFT"
```

**Response 200:** trả về document object đầy đủ đã cập nhật

---

#### PATCH `/admin/documents/:id/toggle-download`
**Nút:** Toggle switch "Allow Download" ở AdminDocumentsPage
**Auth:** Admin

**Request body:** _(không cần, backend tự flip giá trị)_

**Response 200:**
```json
{
  "id": "clx...",
  "allowDownload": true
}
```

---

#### DELETE `/admin/documents/:id`
**Nút:** "Trash" (xóa) ở AdminDocumentsPage
**Auth:** Admin

**Response 200:** `{ "message": "Document deleted" }`

> Xóa file khỏi S3/Supabase Storage, xóa thumbnail khỏi Cloudinary, xóa record DB.

---

### 4.6 Quizzes

#### GET `/quizzes`
**Nút:** Tự động khi load QuizListingPage
**Auth:** Public

**Query params:**
```
?search=electrochemistry
&difficulty=HARD
&tagIds=clx1,clx2
&hasReward=true
&page=1
&limit=12
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "15-Question Quiz: Basic Ester Theory",
      "description": "...",
      "topic": "Ester",
      "timeLimit": 20,
      "difficulty": "MEDIUM",
      "isPublished": true,
      "hasReward": false,
      "rewardDescription": null,
      "participantsCount": 342,
      "questionCount": 15,
      "tags": [...]
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 8, "totalPages": 1 }
}
```
> Chỉ trả quizzes có `isPublished = true`.

---

#### GET `/quizzes/featured`
**Nút:** Tự động khi load HomePage (quizzes section)
**Auth:** Public

**Response 200:**
```json
{
  "data": [ ...same format, tối đa 3 quizzes, sorted by participantsCount DESC... ]
}
```

---

#### GET `/quizzes/:id`
**Nút:** "Join Now" → load QuizTakingPage
**Auth:** Auth (phải đăng nhập mới được làm quiz)

**Response 200:**
```json
{
  "id": "clx...",
  "title": "15-Question Quiz: Basic Ester Theory",
  "description": "...",
  "timeLimit": 20,
  "difficulty": "MEDIUM",
  "hasReward": false,
  "questionCount": 15,
  "questions": [
    {
      "id": "clx...",
      "questionText": "Which of the following is the correct IUPAC name for CH₃COOCH₂CH₃?",
      "questionImageUrl": null,
      "orderIndex": 0,
      "options": [
        { "id": "clx-opt1", "optionText": "Ethyl methanoate", "orderIndex": 0 },
        { "id": "clx-opt2", "optionText": "Ethyl ethanoate", "orderIndex": 1 },
        { "id": "clx-opt3", "optionText": "Methyl ethanoate", "orderIndex": 2 },
        { "id": "clx-opt4", "optionText": "Propyl methanoate", "orderIndex": 3 }
      ]
    }
  ]
}
```
> **Quan trọng:** Không trả `isCorrect` và `explanation` — chỉ trả sau submit.

---

#### POST `/quizzes/:id/submit`
**Nút:** "Nộp Bài" ở QuizTakingPage
**Auth:** Auth

**Request body:**
```json
{
  "answers": [
    { "questionId": "clx-q1", "selectedOptionId": "clx-opt2" },
    { "questionId": "clx-q2", "selectedOptionId": "clx-opt1" }
  ],
  "timeTakenSecs": 450
}
```

**Response 201:**
```json
{
  "submissionId": "clx...",
  "score": 8,
  "totalQuestions": 10,
  "percentage": 80,
  "passed": true,
  "results": [
    {
      "questionId": "clx-q1",
      "questionText": "Which IUPAC name for CH₃COOCH₂CH₃?",
      "selectedOptionId": "clx-opt2",
      "correctOptionId": "clx-opt2",
      "isCorrect": true,
      "explanation": "Ethyl ethanoate is formed from..."
    }
  ]
}
```

**Response 409:** `{ "error": "You have already submitted this quiz" }`

---

#### GET `/quizzes/:id/submissions/me`
**Nút:** Tự động khi load QuizResultPage (lấy kết quả đã submit)
**Auth:** Auth

**Response 200:** (giống response của POST /quizzes/:id/submit)

**Response 404:** `{ "error": "No submission found for this quiz" }`

---

#### GET `/admin/quizzes`
**Nút:** Tự động khi load AdminQuizzesPage
**Auth:** Admin

**Query params:**
```
?search=keyword
&status=published   # published | draft
&page=1
&limit=20
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "...",
      "topic": "Ester",
      "timeLimit": 20,
      "difficulty": "MEDIUM",
      "isPublished": true,
      "hasReward": false,
      "participantsCount": 342,
      "questionCount": 15,
      "tags": [...],
      "createdAt": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```
> Admin thấy cả draft và published.

---

#### POST `/admin/quizzes`
**Nút:** "Publish Quiz" và "Save as Draft" ở AdminCreateQuizPage
**Auth:** Admin

**Request body:**
```json
{
  "title": "15-Question Quiz: Basic Ester Theory",
  "description": "Test your understanding of ester formation...",
  "topic": "Ester",
  "timeLimit": 20,
  "difficulty": "MEDIUM",
  "hasReward": false,
  "rewardDescription": null,
  "tagIds": ["clx-tag1", "clx-tag2"],
  "isPublished": true,
  "questions": [
    {
      "questionText": "Which is the correct IUPAC name for CH₃COOCH₂CH₃?",
      "questionImageUrl": null,
      "explanation": "Ethyl ethanoate is formed from ethanoic acid and ethanol.",
      "orderIndex": 0,
      "options": [
        { "optionText": "Ethyl methanoate", "isCorrect": false, "orderIndex": 0 },
        { "optionText": "Ethyl ethanoate", "isCorrect": true, "orderIndex": 1 },
        { "optionText": "Methyl ethanoate", "isCorrect": false, "orderIndex": 2 },
        { "optionText": "Propyl methanoate", "isCorrect": false, "orderIndex": 3 }
      ]
    }
  ]
}
```

**Response 201:**
```json
{
  "id": "clx...",
  "title": "...",
  "isPublished": true,
  "questionCount": 1
}
```

**Validation errors:**
- Mỗi question phải có đúng 1 option có `isCorrect: true`
- Phải có ít nhất 1 question

---

#### PATCH `/admin/quizzes/:id`
**Nút:** "Save & Publish" / "Save as Draft" ở AdminEditQuizPage
**Auth:** Admin

**Request body:** (giống POST /admin/quizzes, tất cả fields optional, riêng `questions` nếu có sẽ replace toàn bộ)

**Response 200:** trả về quiz đã cập nhật

---

#### PATCH `/admin/quizzes/:id/publish`
**Nút:** Toggle publish ở AdminQuizzesPage (nếu cần nút publish/unpublish riêng)
**Auth:** Admin

**Request body:**
```json
{
  "isPublished": true
}
```

**Response 200:** `{ "id": "clx...", "isPublished": true }`

---

#### POST `/admin/quizzes/:id/duplicate`
**Nút:** "Copy" (nút clone quiz) ở AdminQuizzesPage
**Auth:** Admin

**Response 201:**
```json
{
  "id": "clx-new...",
  "title": "Copy of 15-Question Quiz: Basic Ester Theory",
  "isPublished": false
}
```

---

#### DELETE `/admin/quizzes/:id`
**Nút:** "Trash" (xóa) ở AdminQuizzesPage
**Auth:** Admin

**Response 200:** `{ "message": "Quiz deleted" }`

---

### 4.7 Community Q&A

#### GET `/community/questions`
**Nút:** Tự động khi load CommunityQuestionsPage
**Auth:** Public

**Query params:**
```
?search=electrochemistry
&tagIds=clx1,clx2
&page=1
&limit=10
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Please help me solve this electrochemistry problem",
      "content": "I am stuck on calculating...",
      "status": "APPROVED",
      "createdAt": "2026-04-08T00:00:00Z",
      "answerCount": 5,
      "user": {
        "id": "clx...",
        "username": "nguyenminhan",
        "fullName": "Nguyễn Minh An",
        "avatarUrl": "..."
      },
      "tags": [
        { "id": "clx...", "name": "Electrochemistry" }
      ],
      "images": [
        { "imageUrl": "...", "orderIndex": 0 }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 28, "totalPages": 3 }
}
```
> Chỉ trả câu hỏi `status = APPROVED`.

---

#### GET `/community/questions/:id`
**Nút:** Click vào question card → load QuestionDetailPage
**Auth:** Public

**Response 200:**
```json
{
  "id": "clx...",
  "title": "...",
  "content": "...",
  "status": "APPROVED",
  "createdAt": "...",
  "answerCount": 5,
  "user": { "id": "...", "username": "...", "fullName": "...", "avatarUrl": "..." },
  "tags": [...],
  "images": [
    { "imageUrl": "...", "orderIndex": 0 }
  ]
}
```

---

#### GET `/community/questions/:id/answers`
**Nút:** Tự động khi load QuestionDetailPage (load danh sách answers)
**Auth:** Public

**Query params:**
```
?page=1
&limit=20
&sortBy=upvotes   # upvotes | newest
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "content": "To calculate the cell potential...",
      "upvotes": 12,
      "isUpvotedByMe": false,
      "createdAt": "2026-04-08T00:00:00Z",
      "user": {
        "id": "clx...",
        "username": "drkhoa",
        "fullName": "Dr. Nguyễn Văn Khoa",
        "avatarUrl": "..."
      },
      "images": [
        { "imageUrl": "...", "orderIndex": 0 }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```
> `isUpvotedByMe` trả `false` nếu user chưa login.

---

#### POST `/community/questions`
**Nút:** "Submit Question" ở PostQuestionPage
**Auth:** Auth
**Content-Type:** `multipart/form-data`

**Form fields:**
```
title:       string (required)
content:     string (required)
tagIds:      JSON string array, e.g. '["clx1","clx2"]' (required, min 1)
images[]:    (binary files, optional, max 3, each max 5MB, JPG/PNG/WEBP/GIF)
```

**Response 201:**
```json
{
  "id": "clx...",
  "title": "...",
  "status": "PENDING",
  "message": "Question submitted for review. Admin will approve it within 24 hours."
}
```

---

#### POST `/community/questions/:id/answers`
**Nút:** "Submit Answer" ở QuestionDetailPage
**Auth:** Auth
**Content-Type:** `multipart/form-data`

**Form fields:**
```
content:     string (required)
images[]:    (binary files, optional, max 3, each max 5MB)
```

**Response 201:**
```json
{
  "id": "clx...",
  "content": "...",
  "upvotes": 0,
  "isUpvotedByMe": false,
  "createdAt": "...",
  "user": { "id": "...", "username": "...", "fullName": "...", "avatarUrl": "..." },
  "images": []
}
```

---

#### POST `/community/answers/:id/upvote`
**Nút:** Nút thumb-up ở QuestionDetailPage (upvote lần đầu)
**Auth:** Auth

**Response 200:**
```json
{
  "answerId": "clx...",
  "upvotes": 13,
  "isUpvotedByMe": true
}
```

---

#### DELETE `/community/answers/:id/upvote`
**Nút:** Nút thumb-up ở QuestionDetailPage (bỏ upvote khi click lại)
**Auth:** Auth

**Response 200:**
```json
{
  "answerId": "clx...",
  "upvotes": 12,
  "isUpvotedByMe": false
}
```

---

#### GET `/admin/community/questions`
**Nút:** Tự động khi load AdminQuestionApprovalPage
**Auth:** Admin

**Query params:**
```
?status=PENDING   # PENDING | APPROVED | REJECTED | REVISION_REQUESTED
&page=1
&limit=20
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "...",
      "content": "...",
      "status": "PENDING",
      "adminNote": null,
      "createdAt": "...",
      "user": { "id": "...", "username": "...", "fullName": "...", "avatarUrl": "..." },
      "tags": [...],
      "images": [...]
    }
  ],
  "counts": {
    "PENDING": 3,
    "APPROVED": 24,
    "REJECTED": 1,
    "REVISION_REQUESTED": 0
  },
  "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

#### PATCH `/admin/community/questions/:id/approve`
**Nút:** "Approve" ở AdminQuestionApprovalPage
**Auth:** Admin

**Request body:** _(không cần)_

**Response 200:**
```json
{
  "id": "clx...",
  "status": "APPROVED",
  "reviewedAt": "2026-04-12T10:00:00Z"
}
```

---

#### PATCH `/admin/community/questions/:id/reject`
**Nút:** "Reject" ở AdminQuestionApprovalPage
**Auth:** Admin

**Request body:**
```json
{
  "adminNote": "Câu hỏi không đủ thông tin, vui lòng bổ sung thêm chi tiết."
}
```

**Response 200:**
```json
{
  "id": "clx...",
  "status": "REJECTED",
  "adminNote": "Câu hỏi không đủ thông tin..."
}
```

---

#### PATCH `/admin/community/questions/:id/request-revision`
**Nút:** "Request Revision" ở AdminQuestionApprovalPage
**Auth:** Admin

**Request body:**
```json
{
  "adminNote": "Vui lòng thêm ảnh minh họa cho bài toán."
}
```

**Response 200:**
```json
{
  "id": "clx...",
  "status": "REVISION_REQUESTED",
  "adminNote": "Vui lòng thêm ảnh minh họa..."
}
```

---

### 4.8 Admin Dashboard Stats

#### GET `/admin/stats`
**Nút:** Tự động khi load AdminDashboard
**Auth:** Admin

**Response 200:**
```json
{
  "totalDocuments": 42,
  "totalPublishedDocuments": 36,
  "totalPublishedQuizzes": 8,
  "totalDraftQuizzes": 4,
  "pendingQuestions": 3,
  "totalCommunityQuestions": 28,
  "totalUsers": 156,
  "activeUsers": 154,
  "totalQuizSubmissions": 892,
  "totalDocumentDownloads": 6517,
  "charts": {
    "downloads": [
      { "month": "Oct", "count": 1200 },
      { "month": "Nov", "count": 1890 }
    ],
    "quizParticipations": [
      { "week": "Week 1", "count": 234 },
      { "week": "Week 2", "count": 345 }
    ]
  }
}
```

---

### 4.9 Upload Image (standalone)

#### POST `/upload/image`
**Nút:** Nút "Upload Image" ở PostQuestionPage, QuestionDetailPage (answer images), EditProfilePage (khi trực tiếp upload trước khi submit)
**Auth:** Auth
**Content-Type:** `multipart/form-data`

**Form fields:**
```
image:  (binary, required, max 5MB, JPG/PNG/WEBP/GIF)
type:   "question" | "answer" | "avatar"
```

**Response 200:**
```json
{
  "imageUrl": "https://res.cloudinary.com/chemischill/image/upload/question-images/clx...",
  "imageKey": "chemischill/question-images/clx..."
}
```

---

## 5. Authentication Design

### 5.1 JWT Flow

```
[Frontend]                          [Backend]
   │                                     │
   ├── POST /auth/login ───────────────► │
   │                                     │ validate → tạo tokens
   │ ◄── { user, accessToken } ──────── │
   │ ◄── Set-Cookie: refreshToken=... ── │ (httpOnly cookie)
   │                                     │
   │ (lưu accessToken trong memory/      │
   │  localStorage — frontend tự chọn)  │
   │                                     │
   ├── GET /users/me                     │
   │   Authorization: Bearer <access>   │
   │ ◄── user data ─────────────────── │
   │                                     │
   │ (access token hết hạn 15 phút)     │
   │                                     │
   ├── POST /auth/refresh ─────────────►│
   │   (cookie gửi kèm tự động)         │ verify refresh token
   │ ◄── { accessToken (mới) } ──────── │
```

**Access token:** hết hạn sau **15 phút**
**Refresh token:** hết hạn sau **7 ngày**, `httpOnly; Secure; SameSite=Strict`

---

## 6. File Upload Strategy

### 6.1 Documents (PDF/DOC/DOCX)

Dùng **Supabase Storage** (free 1GB) hoặc **AWS S3**:
```
Bucket path: documents/{documentId}/{original-filename}
```
- Upload từ backend (`await file.read()` bytes → `upload_to_supabase()`)
- Lưu `fileKey` vào DB để xóa sau
- Khi user download: tạo signed URL hết hạn 5 phút

### 6.2 Images (avatar, question, answer images)

Dùng **Cloudinary**:
```
Folders:
  chemischill/avatars/
  chemischill/question-images/
  chemischill/answer-images/
```
- Upload qua `cloudinary.uploader.upload(bytes_data, ...)`
- Avatar: resize về `200x200`, crop `fill`
- Lưu `secure_url` + `public_id` vào DB

### 6.3 Giới hạn file

| Loại | Max size | Định dạng |
|---|---|---|
| Document | 50 MB | PDF, DOC, DOCX |
| Thumbnail | 2 MB | JPG, PNG, WEBP |
| Question/Answer image | 5 MB | JPG, PNG, WEBP, GIF |
| Avatar | 2 MB | JPG, PNG, WEBP |
| Max images per question | — | 3 files |
| Max images per answer | — | 3 files |

---

## 7. Step-by-Step Implementation Guide

### Setup môi trường

```bash
cd backend

# Tạo virtualenv
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Copy và điền env vars
cp .env.example .env
```

### Phase 1 — Foundation & Auth (tuần 1)

```bash
# Tạo PostgreSQL database
createdb chemischill

# Autogenerate migration từ SQLAlchemy models
alembic revision --autogenerate -m "init"
alembic upgrade head

# Seed dữ liệu mẫu (tags, categories, admin user)
python seed.py
```

1. Kiểm tra `app/models/models.py` — đủ tất cả models
2. `alembic upgrade head` — sync schema lên DB
3. `python seed.py` — tạo dữ liệu mẫu
4. Chạy server: `uvicorn app.main:app --reload`
5. Vào `http://localhost:8000/docs` để test các auth endpoints
6. Test với Postman hoặc Swagger UI

### Phase 2 — Documents (tuần 2)

7. Điền Cloudinary + Supabase credentials vào `.env`
8. Test upload ảnh qua `POST /upload/image`
9. Test upload document qua `POST /admin/documents`
10. Kiểm tra tags + categories endpoints

### Phase 3 — Quizzes (tuần 3)

11. Test tạo quiz qua `POST /admin/quizzes`
12. Test take quiz: `GET /quizzes/:id` → `POST /quizzes/:id/submit`
13. Kiểm tra leaderboard: `GET /leaderboard`

### Phase 4 — Community Q&A (tuần 4)

14. Test submit question → admin approve → public list
15. Test answer + upvote flow
16. Kiểm tra `GET /admin/stats`

### Phase 5 — Polish & Deploy (tuần 5)

17. Thêm per-route rate limiting với `@limiter.limit("10/15minutes")` trên auth routes
18. Deploy: **Railway** hoặc **Render** (backend) + **Supabase** (DB + Storage)
19. Set `ENVIRONMENT=production` để enable `Secure` cookie flag

---

## 8. Environment Variables

```env
# .env.example

PORT=8000
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@localhost:5432/chemischill

JWT_SECRET=your-super-secret-key-minimum-32-chars
JWT_REFRESH_SECRET=another-secret-key-minimum-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
SUPABASE_STORAGE_BUCKET=chemischill-docs
```

> **Lưu ý:** Tên biến thay đổi so với phiên bản Node.js:
> - `NODE_ENV` → `ENVIRONMENT`
> - `ACCESS_TOKEN_EXPIRES_IN=15m` → `ACCESS_TOKEN_EXPIRE_MINUTES=15` (integer)
> - `REFRESH_TOKEN_EXPIRES_IN=7d` → `REFRESH_TOKEN_EXPIRE_DAYS=7` (integer)
> - `PORT=3000` → `PORT=8000`

---

## 9. Security Checklist

- [x] Passwords hashed bằng **bcrypt** — `passlib[bcrypt]`
- [x] Refresh token trong **httpOnly cookie** — không accessible bằng JS
- [x] Download: kiểm tra `allow_download` tại **backend** — không tin frontend
- [x] Admin endpoints: `require_admin` dependency kiểm tra `role == ADMIN`
- [x] File upload: validate `content_type` (MIME) của `UploadFile`
- [x] File size limit: kiểm tra `len(await file.read())` trước khi upload
- [x] SQL injection: SQLAlchemy parameterized queries — safe by default
- [x] Rate limiting: `slowapi` — default 200/min, có thể thêm per-route
- [x] CORS: chỉ allow `FRONTEND_URL`
- [x] Community questions: chỉ trả `APPROVED` cho public endpoints
- [x] Quiz submission: validate questionId + optionId thuộc đúng quiz

---

## 10. Tóm tắt API List

| # | Method | Endpoint | Auth |
|---|---|---|---|
| 1 | POST | `/auth/register` | Public |
| 2 | POST | `/auth/login` | Public |
| 3 | POST | `/auth/logout` | Auth |
| 4 | POST | `/auth/refresh` | Public |
| 5 | GET | `/users/me` | Auth |
| 6 | PATCH | `/users/me` | Auth |
| 7 | POST | `/users/me/avatar` | Auth |
| 8 | GET | `/users/:id` | Public |
| 9 | GET | `/leaderboard` | Public |
| 10 | GET | `/admin/users` | Admin |
| 11 | PATCH | `/admin/users/:id/status` | Admin |
| 12 | GET | `/tags` | Public |
| 13 | POST | `/admin/tags` | Admin |
| 14 | PATCH | `/admin/tags/:id` | Admin |
| 15 | DELETE | `/admin/tags/:id` | Admin |
| 16 | GET | `/categories` | Public |
| 17 | POST | `/admin/categories` | Admin |
| 18 | PATCH | `/admin/categories/:id` | Admin |
| 19 | DELETE | `/admin/categories/:id` | Admin |
| 20 | GET | `/documents` | Public |
| 21 | GET | `/documents/featured` | Public |
| 22 | GET | `/documents/:id` | Public |
| 23 | POST | `/documents/:id/view` | Public |
| 24 | GET | `/documents/:id/download` | Auth |
| 25 | POST | `/admin/documents` | Admin |
| 26 | PATCH | `/admin/documents/:id` | Admin |
| 27 | PATCH | `/admin/documents/:id/toggle-download` | Admin |
| 28 | DELETE | `/admin/documents/:id` | Admin |
| 29 | GET | `/quizzes` | Public |
| 30 | GET | `/quizzes/featured` | Public |
| 31 | GET | `/quizzes/:id` | Auth |
| 32 | POST | `/quizzes/:id/submit` | Auth |
| 33 | GET | `/quizzes/:id/submissions/me` | Auth |
| 34 | GET | `/admin/quizzes` | Admin |
| 35 | POST | `/admin/quizzes` | Admin |
| 36 | PATCH | `/admin/quizzes/:id` | Admin |
| 37 | PATCH | `/admin/quizzes/:id/publish` | Admin |
| 38 | POST | `/admin/quizzes/:id/duplicate` | Admin |
| 39 | DELETE | `/admin/quizzes/:id` | Admin |
| 40 | GET | `/community/questions` | Public |
| 41 | GET | `/community/questions/:id` | Public |
| 42 | GET | `/community/questions/:id/answers` | Public |
| 43 | POST | `/community/questions` | Auth |
| 44 | POST | `/community/questions/:id/answers` | Auth |
| 45 | POST | `/community/answers/:id/upvote` | Auth |
| 46 | DELETE | `/community/answers/:id/upvote` | Auth |
| 47 | GET | `/admin/community/questions` | Admin |
| 48 | PATCH | `/admin/community/questions/:id/approve` | Admin |
| 49 | PATCH | `/admin/community/questions/:id/reject` | Admin |
| 50 | PATCH | `/admin/community/questions/:id/request-revision` | Admin |
| 51 | GET | `/admin/stats` | Admin |
| 52 | POST | `/upload/image` | Auth |
