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
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = ""
    r2_endpoint_url: str = ""
    r2_public_base_url: str = ""


class RootConfig(BaseModel):
    app: AppConfig = AppConfig()
    authentication: AuthConfig
    database: DatabaseConfig
    storage: StorageConfig
