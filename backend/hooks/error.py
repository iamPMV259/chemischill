class BaseAppException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class NotFoundError(BaseAppException):
    def __init__(self, message: str = "Not found"):
        super().__init__(message, 404)


class UnauthorizedError(BaseAppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401)


class ForbiddenError(BaseAppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, 403)


class ConflictError(BaseAppException):
    def __init__(self, message: str = "Conflict"):
        super().__init__(message, 409)


class ValidationError(BaseAppException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, 400)
