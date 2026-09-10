import os
from functools import wraps

import jwt
from flask import request, jsonify


def authenticate_token(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization token is required"
            }), 401

        parts = auth_header.split(" ")

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "message": "Invalid authorization format"
            }), 401

        token = parts[1]

        try:

            payload = jwt.decode(
                token,
                os.getenv("JWT_SECRET"),
                algorithms=["HS256"]
            )

            request.user = payload

            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:

            return jsonify({
                "success": False,
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:

            return jsonify({
                "success": False,
                "message": "Invalid token"
            }), 401

    return decorated


# ==========================================
# ADMIN AUTHORIZATION
# ==========================================

def admin_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        user = getattr(request, "user", None)

        if not user:
            return jsonify({
                "success": False,
                "message": "Authentication required"
            }), 401

        if user.get("role") != "admin":
            return jsonify({
                "success": False,
                "message": "Admin access required"
            }), 403

        return f(*args, **kwargs)

    return decorated

