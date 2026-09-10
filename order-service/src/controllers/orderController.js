const orderService =
    require("../services/orderService");


// ==========================================
// CREATE ORDER
// ==========================================

async function createOrder(req, res) {

    try {

        const userId =
            req.user.userId;

        const {
            product_id,
            quantity
        } = req.body;


        // --------------------------------------
        // Validate product ID
        // --------------------------------------

        if (
            product_id === undefined ||
            !Number.isInteger(Number(product_id)) ||
            Number(product_id) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid product_id is required"

            });

        }


        // --------------------------------------
        // Validate quantity
        // --------------------------------------

        if (
            quantity === undefined ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Quantity must be greater than 0"

            });

        }


        // --------------------------------------
        // Get JWT token
        // --------------------------------------

        const authHeader =
            req.headers.authorization;

        const token =
            authHeader.split(" ")[1];


        // --------------------------------------
        // Create order
        // --------------------------------------

        const order =
            await orderService.createOrder(

                userId,

                Number(product_id),

                Number(quantity),

                token

            );


        res.status(201).json({

            success: true,

            message:
                "Order created successfully",

            order

        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        // Product not found
        if (
            error.message.includes(
                "Product Service returned 404"
            ) ||
            error.message ===
                "Product not found"
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        // Insufficient stock
        if (
            error.message ===
                "Insufficient product stock"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Insufficient product stock"

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to create order"

        });

    }

}


// ==========================================
// GET MY ORDERS
// ==========================================

async function getMyOrders(req, res) {

    try {

        const userId =
            req.user.userId;


        const orders =
            await orderService
                .getOrdersByUser(userId);


        res.json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to get orders"

        });

    }

}


// ==========================================
// COMPLETE ORDER
// ==========================================

async function completeOrder(req, res) {

    try {

        const userId =
            req.user.userId;

        const orderId =
            Number(req.params.id);


        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID"

            });

        }


        const order =
            await orderService.completeOrder(
                orderId,
                userId
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found or already completed"

            });

        }


        res.json({

            success: true,

            message:
                "Order completed successfully",

            order

        });


    } catch (error) {

        console.error(
            "Complete order error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to complete order"

        });

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createOrder,

    getMyOrders,

    completeOrder

};