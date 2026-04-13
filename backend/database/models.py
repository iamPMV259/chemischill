import enum
from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    String, Integer, Boolean, DateTime, ForeignKey, Text,
    Enum as SAEnum,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def gen_id() -> str:
    return str(uuid4())


class Base(DeclarativeBase):
    pass


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


class QuizAttemptModeEnum(str, enum.Enum):
    SINGLE = "SINGLE"
    MULTIPLE = "MULTIPLE"


class QuizRetryScoreModeEnum(str, enum.Enum):
    FULL = "FULL"
    REDUCED = "REDUCED"
    ZERO = "ZERO"


class QuestionStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"


# ─── User ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    phone: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_key: Mapped[str | None] = mapped_column(String, nullable=True)
    birth_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    school: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[RoleEnum] = mapped_column(SAEnum(RoleEnum), default=RoleEnum.USER)
    status: Mapped[UserStatusEnum] = mapped_column(SAEnum(UserStatusEnum), default=UserStatusEnum.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    uploaded_documents: Mapped[list["Document"]] = relationship(back_populates="uploaded_by")
    quiz_submissions: Mapped[list["QuizSubmission"]] = relationship(back_populates="user")
    community_questions: Mapped[list["CommunityQuestion"]] = relationship(
        foreign_keys="CommunityQuestion.user_id", back_populates="user"
    )
    community_answers: Mapped[list["CommunityAnswer"]] = relationship(back_populates="user")
    answer_upvotes: Mapped[list["AnswerUpvote"]] = relationship(back_populates="user")
    reviewed_questions: Mapped[list["CommunityQuestion"]] = relationship(
        foreign_keys="CommunityQuestion.reviewed_by_id", back_populates="reviewed_by"
    )
    created_quizzes: Mapped[list["Quiz"]] = relationship(back_populates="created_by")


# ─── Category ─────────────────────────────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    name_vi: Mapped[str] = mapped_column(String, nullable=False)
    name_en: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    parent_id: Mapped[str | None] = mapped_column(String, ForeignKey("categories.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    parent: Mapped["Category | None"] = relationship(
        "Category", remote_side="Category.id", back_populates="children"
    )
    children: Mapped[list["Category"]] = relationship("Category", back_populates="parent")
    documents: Mapped[list["Document"]] = relationship(back_populates="category")


# ─── Tag ──────────────────────────────────────────────────────────────────────

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name_vi: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[TagCategoryEnum] = mapped_column(SAEnum(TagCategoryEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document_tags: Mapped[list["DocumentTag"]] = relationship(back_populates="tag", cascade="all, delete-orphan")
    quiz_tags: Mapped[list["QuizTag"]] = relationship(back_populates="tag", cascade="all, delete-orphan")
    community_question_tags: Mapped[list["CommunityQuestionTag"]] = relationship(back_populates="tag", cascade="all, delete-orphan")


# ─── Document ─────────────────────────────────────────────────────────────────

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    file_url: Mapped[str] = mapped_column(String, nullable=False)
    file_key: Mapped[str] = mapped_column(String, nullable=False)
    file_type: Mapped[FileTypeEnum] = mapped_column(SAEnum(FileTypeEnum), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String, nullable=True)
    thumbnail_key: Mapped[str | None] = mapped_column(String, nullable=True)
    allow_download: Mapped[bool] = mapped_column(Boolean, default=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[DocumentStatusEnum] = mapped_column(SAEnum(DocumentStatusEnum), default=DocumentStatusEnum.DRAFT)
    views: Mapped[int] = mapped_column(Integer, default=0)
    downloads: Mapped[int] = mapped_column(Integer, default=0)
    uploaded_by_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    category_id: Mapped[str | None] = mapped_column(String, ForeignKey("categories.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    uploaded_by: Mapped["User"] = relationship(back_populates="uploaded_documents")
    category: Mapped["Category | None"] = relationship(back_populates="documents")
    tags: Mapped[list["DocumentTag"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    bookmarks: Mapped[list["DocumentBookmark"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    download_events: Mapped[list["DocumentDownload"]] = relationship(back_populates="document", cascade="all, delete-orphan")


class DocumentTag(Base):
    __tablename__ = "document_tags"

    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[str] = mapped_column(String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    document: Mapped["Document"] = relationship(back_populates="tags")
    tag: Mapped["Tag"] = relationship(back_populates="document_tags")


class DocumentBookmark(Base):
    __tablename__ = "document_bookmarks"

    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship()
    document: Mapped["Document"] = relationship(back_populates="bookmarks")


class DocumentDownload(Base):
    __tablename__ = "document_downloads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship()
    document: Mapped["Document"] = relationship(back_populates="download_events")


# ─── Quiz ─────────────────────────────────────────────────────────────────────

class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    topic: Mapped[str | None] = mapped_column(String, nullable=True)
    time_limit: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[DifficultyEnum] = mapped_column(SAEnum(DifficultyEnum), default=DifficultyEnum.MEDIUM)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    total_points: Mapped[int] = mapped_column(Integer, default=100)
    attempt_mode: Mapped[QuizAttemptModeEnum] = mapped_column(SAEnum(QuizAttemptModeEnum), default=QuizAttemptModeEnum.SINGLE)
    retry_score_mode: Mapped[QuizRetryScoreModeEnum] = mapped_column(SAEnum(QuizRetryScoreModeEnum), default=QuizRetryScoreModeEnum.ZERO)
    retry_penalty_percent: Mapped[int] = mapped_column(Integer, default=50)
    count_points_once: Mapped[bool] = mapped_column(Boolean, default=True)
    available_from: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    available_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    has_reward: Mapped[bool] = mapped_column(Boolean, default=False)
    reward_description: Mapped[str | None] = mapped_column(String, nullable=True)
    participants_count: Mapped[int] = mapped_column(Integer, default=0)
    created_by_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    created_by: Mapped["User"] = relationship(back_populates="created_quizzes")
    questions: Mapped[list["QuizQuestion"]] = relationship(back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.order_index")
    submissions: Mapped[list["QuizSubmission"]] = relationship(back_populates="quiz")
    tags: Mapped[list["QuizTag"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class QuizTag(Base):
    __tablename__ = "quiz_tags"

    quiz_id: Mapped[str] = mapped_column(String, ForeignKey("quizzes.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[str] = mapped_column(String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    quiz: Mapped["Quiz"] = relationship(back_populates="tags")
    tag: Mapped["Tag"] = relationship(back_populates="quiz_tags")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    quiz_id: Mapped[str] = mapped_column(String, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    quiz: Mapped["Quiz"] = relationship(back_populates="questions")
    options: Mapped[list["QuizOption"]] = relationship(back_populates="question", cascade="all, delete-orphan", order_by="QuizOption.order_index")
    submission_answers: Mapped[list["QuizSubmissionAnswer"]] = relationship(back_populates="question")


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped["QuizQuestion"] = relationship(back_populates="options")
    submission_answers: Mapped[list["QuizSubmissionAnswer"]] = relationship(back_populates="selected_option")


class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    quiz_id: Mapped[str] = mapped_column(String, ForeignKey("quizzes.id"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    awarded_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    time_taken_secs: Mapped[int | None] = mapped_column(Integer, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="quiz_submissions")
    quiz: Mapped["Quiz"] = relationship(back_populates="submissions")
    answers: Mapped[list["QuizSubmissionAnswer"]] = relationship(back_populates="submission", cascade="all, delete-orphan")


class QuizSubmissionAnswer(Base):
    __tablename__ = "quiz_submission_answers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    submission_id: Mapped[str] = mapped_column(String, ForeignKey("quiz_submissions.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("quiz_questions.id"), nullable=False)
    selected_option_id: Mapped[str | None] = mapped_column(String, ForeignKey("quiz_options.id"), nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)

    submission: Mapped["QuizSubmission"] = relationship(back_populates="answers")
    question: Mapped["QuizQuestion"] = relationship(back_populates="submission_answers")
    selected_option: Mapped["QuizOption | None"] = relationship(back_populates="submission_answers")


# ─── Community Q&A ────────────────────────────────────────────────────────────

class CommunityQuestion(Base):
    __tablename__ = "community_questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[QuestionStatusEnum] = mapped_column(SAEnum(QuestionStatusEnum), default=QuestionStatusEnum.PENDING)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(foreign_keys=[user_id], back_populates="community_questions")
    reviewed_by: Mapped["User | None"] = relationship(foreign_keys=[reviewed_by_id], back_populates="reviewed_questions")
    images: Mapped[list["CommunityQuestionImage"]] = relationship(back_populates="question", cascade="all, delete-orphan", order_by="CommunityQuestionImage.order_index")
    answers: Mapped[list["CommunityAnswer"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    tags: Mapped[list["CommunityQuestionTag"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class CommunityQuestionImage(Base):
    __tablename__ = "community_question_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("community_questions.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    image_key: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped["CommunityQuestion"] = relationship(back_populates="images")


class CommunityQuestionTag(Base):
    __tablename__ = "community_question_tags"

    question_id: Mapped[str] = mapped_column(String, ForeignKey("community_questions.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[str] = mapped_column(String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    question: Mapped["CommunityQuestion"] = relationship(back_populates="tags")
    tag: Mapped["Tag"] = relationship(back_populates="community_question_tags")


class CommunityAnswer(Base):
    __tablename__ = "community_answers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("community_questions.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    reply_to_answer_id: Mapped[str | None] = mapped_column(String, ForeignKey("community_answers.id", ondelete="CASCADE"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    question: Mapped["CommunityQuestion"] = relationship(back_populates="answers")
    user: Mapped["User"] = relationship(back_populates="community_answers")
    images: Mapped[list["CommunityAnswerImage"]] = relationship(back_populates="answer", cascade="all, delete-orphan", order_by="CommunityAnswerImage.order_index")
    upvoted_by: Mapped[list["AnswerUpvote"]] = relationship(back_populates="answer", cascade="all, delete-orphan")
    parent_answer: Mapped["CommunityAnswer | None"] = relationship(remote_side="CommunityAnswer.id", back_populates="replies")
    replies: Mapped[list["CommunityAnswer"]] = relationship(back_populates="parent_answer", cascade="all, delete-orphan")


class CommunityAnswerImage(Base):
    __tablename__ = "community_answer_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    answer_id: Mapped[str] = mapped_column(String, ForeignKey("community_answers.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    image_key: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    answer: Mapped["CommunityAnswer"] = relationship(back_populates="images")


class AnswerUpvote(Base):
    __tablename__ = "answer_upvotes"

    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), primary_key=True)
    answer_id: Mapped[str] = mapped_column(String, ForeignKey("community_answers.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="answer_upvotes")
    answer: Mapped["CommunityAnswer"] = relationship(back_populates="upvoted_by")


class TeacherInquiry(Base):
    __tablename__ = "teacher_inquiries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    teacher_id: Mapped[str] = mapped_column(String, nullable=False)
    teacher_name: Mapped[str] = mapped_column(String, nullable=False)
    sender_user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    sender_name: Mapped[str] = mapped_column(String, nullable=False)
    sender_email: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sender_user: Mapped["User | None"] = relationship()
