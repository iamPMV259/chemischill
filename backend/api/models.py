"""All Pydantic request/response schemas."""
from pydantic import BaseModel, EmailStr
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    model_config = {"str_strip_whitespace": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    email: str | None
    full_name: str | None
    avatar_url: str | None
    role: str
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    user: UserOut
    access_token: str


class RefreshResponse(BaseModel):
    access_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ─── User ─────────────────────────────────────────────────────────────────────

class UserStats(BaseModel):
    rank: int
    points: int
    quizzes_completed: int
    questions_posted: int


class UserMeOut(BaseModel):
    id: str
    username: str
    email: str | None
    full_name: str | None
    avatar_url: str | None
    phone: str | None
    birth_year: int | None
    school: str | None
    role: str
    created_at: datetime
    stats: UserStats
    model_config = {"from_attributes": True}


class UpdateMeRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    birth_year: int | None = None
    school: str | None = None


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    full_name: str | None
    avatar_url: str | None
    quizzes_completed: int
    total_score: int
    questions_posted: int


class UpdateUserStatusRequest(BaseModel):
    status: str


class TeacherContactRequest(BaseModel):
    sender_name: str
    sender_email: EmailStr
    message: str


# ─── Tag ──────────────────────────────────────────────────────────────────────

class CreateTagRequest(BaseModel):
    name: str
    name_vi: str
    category: str


class UpdateTagRequest(BaseModel):
    name: str | None = None
    name_vi: str | None = None
    category: str | None = None


# ─── Category ─────────────────────────────────────────────────────────────────

class CreateCategoryRequest(BaseModel):
    name_vi: str
    name_en: str
    slug: str | None = None
    parent_id: str | None = None


class UpdateCategoryRequest(BaseModel):
    name_vi: str | None = None
    name_en: str | None = None
    slug: str | None = None
    parent_id: str | None = None


# ─── Quiz ─────────────────────────────────────────────────────────────────────

class OptionInput(BaseModel):
    option_text: str
    is_correct: bool
    order_index: int | None = None


class QuestionInput(BaseModel):
    question_text: str
    question_image_url: str | None = None
    explanation: str | None = None
    order_index: int | None = None
    options: list[OptionInput]


class CreateQuizRequest(BaseModel):
    title: str
    description: str
    topic: str | None = None
    time_limit: int
    difficulty: str = "MEDIUM"
    total_points: int = 100
    attempt_mode: str = "SINGLE"
    retry_score_mode: str = "ZERO"
    retry_penalty_percent: int = 50
    count_points_once: bool = True
    available_from: datetime | None = None
    available_until: datetime | None = None
    has_reward: bool = False
    reward_description: str | None = None
    tag_ids: list[str] = []
    is_published: bool = False
    questions: list[QuestionInput]


class UpdateQuizRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    topic: str | None = None
    time_limit: int | None = None
    difficulty: str | None = None
    total_points: int | None = None
    attempt_mode: str | None = None
    retry_score_mode: str | None = None
    retry_penalty_percent: int | None = None
    count_points_once: bool | None = None
    available_from: datetime | None = None
    available_until: datetime | None = None
    has_reward: bool | None = None
    reward_description: str | None = None
    tag_ids: list[str] | None = None
    is_published: bool | None = None
    questions: list[QuestionInput] | None = None


class PublishQuizRequest(BaseModel):
    is_published: bool


class AnswerInput(BaseModel):
    question_id: str
    selected_option_id: str | None = None


class SubmitQuizRequest(BaseModel):
    answers: list[AnswerInput]
    time_taken_secs: int | None = None


# ─── Community ────────────────────────────────────────────────────────────────

class RejectRequest(BaseModel):
    admin_note: str
