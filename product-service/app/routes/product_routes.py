from flask import Blueprint, request, jsonify

from app.middleware.auth import (
    authenticate_token,
    admin_required
)

from app.services.product_service import (
    create_product,
    get_all_products,
    get_product_by_id,
    update_product,
    delete_product
)


product_routes = Blueprint(
    "product_routes",
    __name__,
    url_prefix="/api/products"
)


# ==========================================
# CREATE PRODUCT
# ADMIN ONLY
# ==========================================

@product_routes.route("", methods=["POST"])
@authenticate_token
@admin_required
def add_product():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400


        required_fields = [
            "name",
            "description",
            "price",
            "stock",
            "category"
        ]


        missing_fields = [
            field
            for field in required_fields
            if field not in data
        ]


        if missing_fields:

            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "fields": missing_fields
            }), 400


        if float(data["price"]) < 0:

            return jsonify({
                "success": False,
                "message": "Price cannot be negative"
            }), 400


        if int(data["stock"]) < 0:

            return jsonify({
                "success": False,
                "message": "Stock cannot be negative"
            }), 400


        product_id = create_product(

            name=data["name"],

            description=data["description"],

            price=data["price"],

            stock=data["stock"],

            category=data["category"],

            image_url=data.get("image_url")

        )


        return jsonify({

            "success": True,

            "message":
                "Product created successfully",

            "product_id":
                product_id

        }), 201


    except (ValueError, TypeError):

        return jsonify({

            "success": False,

            "message":
                "Invalid price or stock value"

        }), 400


    except Exception as error:

        print(
            f"Create product error: {error}"
        )


        return jsonify({

            "success": False,

            "message":
                "Internal server error"

        }), 500


# ==========================================
# GET ALL PRODUCTS
# CUSTOMER + ADMIN
# ==========================================

@product_routes.route("", methods=["GET"])
@authenticate_token
def get_products():

    try:

        products = get_all_products()


        return jsonify({

            "success": True,

            "count": len(products),

            "products": products

        }), 200


    except Exception as error:

        print(
            f"Get products error: {error}"
        )


        return jsonify({

            "success": False,

            "message":
                "Internal server error"

        }), 500


# ==========================================
# GET PRODUCT BY ID
# CUSTOMER + ADMIN
# ==========================================

@product_routes.route(
    "/<int:product_id>",
    methods=["GET"]
)
@authenticate_token
def get_product(product_id):

    try:

        product = get_product_by_id(product_id)


        if not product:

            return jsonify({

                "success": False,

                "message":
                    "Product not found"

            }), 404


        return jsonify({

            "success": True,

            "product":
                product

        }), 200


    except Exception as error:

        print(
            f"Get product error: {error}"
        )


        return jsonify({

            "success": False,

            "message":
                "Internal server error"

        }), 500


# ==========================================
# UPDATE PRODUCT
# ADMIN ONLY
# ==========================================

@product_routes.route(
    "/<int:product_id>",
    methods=["PUT"]
)
@authenticate_token
@admin_required
def edit_product(product_id):

    try:

        data = request.get_json()


        if not data:

            return jsonify({

                "success": False,

                "message":
                    "Request body is required"

            }), 400


        required_fields = [

            "name",
            "description",
            "price",
            "stock",
            "category"

        ]


        missing_fields = [

            field
            for field in required_fields
            if field not in data

        ]


        if missing_fields:

            return jsonify({

                "success": False,

                "message":
                    "Missing required fields",

                "fields":
                    missing_fields

            }), 400


        if float(data["price"]) < 0:

            return jsonify({

                "success": False,

                "message":
                    "Price cannot be negative"

            }), 400


        if int(data["stock"]) < 0:

            return jsonify({

                "success": False,

                "message":
                    "Stock cannot be negative"

            }), 400


        rows_affected = update_product(

            product_id=product_id,

            name=data["name"],

            description=data["description"],

            price=data["price"],

            stock=data["stock"],

            category=data["category"],

            image_url=data.get("image_url")

        )


        if rows_affected == 0:

            return jsonify({

                "success": False,

                "message":
                    "Product not found"

            }), 404


        return jsonify({

            "success": True,

            "message":
                "Product updated successfully"

        }), 200


    except (ValueError, TypeError):

        return jsonify({

            "success": False,

            "message":
                "Invalid price or stock value"

        }), 400


    except Exception as error:

        print(
            f"Update product error: {error}"
        )


        return jsonify({

            "success": False,

            "message":
                "Internal server error"

        }), 500


# ==========================================
# DELETE PRODUCT
# ADMIN ONLY
# ==========================================

@product_routes.route(
    "/<int:product_id>",
    methods=["DELETE"]
)
@authenticate_token
@admin_required
def remove_product(product_id):

    try:

        rows_affected = delete_product(product_id)


        if rows_affected == 0:

            return jsonify({

                "success": False,

                "message":
                    "Product not found"

            }), 404


        return jsonify({

            "success": True,

            "message":
                "Product deleted successfully"

        }), 200


    except Exception as error:

        print(
            f"Delete product error: {error}"
        )


        return jsonify({

            "success": False,

            "message":
                "Internal server error"

        }), 500
