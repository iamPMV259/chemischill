from pydantic import BaseModel


class AppConfig(BaseModel):
    title: str = "ChemisChill API"
    version: str = "1.0.0"
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"
    port: int = 8000


class AuthConfig(BaseModel):
    jwt_secret: str
    jwt_refresh_secret: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7


class DatabaseConfig(BaseModel):
    url: str


class StorageConfig(BaseModel):
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    supabase_url: str
    supabase_service_key: str
    supabase_storage_bucket: str


class RootConfig(BaseModel):
    app: AppConfig = AppConfig()
    authentication: AuthConfig
    database: DatabaseConfig
    storage: StorageConfig
