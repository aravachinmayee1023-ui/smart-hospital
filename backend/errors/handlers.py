"""
Error handlers and custom exception definitions for standardized JSON responses.
"""
from flask import jsonify


class APIError(Exception):
    """Base API exception that can be raised anywhere in service or route layers."""
    def __init__(self, message, code="BAD_REQUEST", status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class NotFoundError(APIError):
    def __init__(self, message="Resource not found", details=None):
        super().__init__(message, code="NOT_FOUND", status_code=404, details=details)


class ValidationError(APIError):
    def __init__(self, message="Validation error", details=None):
        super().__init__(message, code="VALIDATION_ERROR", status_code=422, details=details)


class ResourceConflictError(APIError):
    def __init__(self, message="Resource conflict or capacity exhausted", details=None):
        super().__init__(message, code="RESOURCE_CONFLICT", status_code=409, details=details)


def register_error_handlers(app):
    """Registers centralized JSON error handlers to Flask app instance."""

    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = {
            "success": False,
            "error": {
                "code": error.code,
                "message": error.message,
                "details": error.details
            }
        }
        return jsonify(response), error.status_code

    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({
            "success": False,
            "error": {
                "code": "BAD_REQUEST",
                "message": str(e.description) if hasattr(e, "description") else "Bad request",
                "details": {}
            }
        }), 400

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": "The requested resource or endpoint does not exist",
                "details": {}
            }
        }), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({
            "success": False,
            "error": {
                "code": "METHOD_NOT_ALLOWED",
                "message": "The HTTP method is not supported for this endpoint",
                "details": {}
            }
        }), 405

    @app.errorhandler(500)
    def handle_internal_server_error(e):
        app.logger.error(f"Internal server error: {e}")
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please try again later.",
                "details": {}
            }
        }), 500
