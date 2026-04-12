from . import root_config
from .models import AppConfig, AuthConfig, DatabaseConfig, StorageConfig


class Configs:
    @staticmethod
    def app() -> AppConfig:
        return root_config.app

    @staticmethod
    def auth() -> AuthConfig:
        return root_config.authentication

    @staticmethod
    def database() -> DatabaseConfig:
        return root_config.database

    @staticmethod
    def storage() -> StorageConfig:
        return root_config.storage
