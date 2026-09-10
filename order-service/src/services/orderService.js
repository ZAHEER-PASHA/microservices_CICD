const pool = require("../config/db");


// ==========================================
// PRODUCT SERVICE URL
// ==========================================

const PRODUCT_SERVICE_URL =
    process.env.PRODUCT_SERVICE_URL ||
    "http://product-service:5002";


// ==========================================
// CREATE ORDER
// ==========================================

async function createOrder(
    userId,
    productId,
    quantity,
    token
) {

    // --------------------------------------
    // Get product from Product Service
    // --------------------------------------

    const response = await fetch(
        `${PRODUCT_SERVICE_URL}/api/products/${productId}`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    if (!response.ok) {

        throw new Error(
            `Product Service returned ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !data.success ||
        !data.product
    ) {

        throw new Error(
            "Product not found"
        );

    }


    const product =
        data.product;


    // --------------------------------------
    // Validate stock
    // --------------------------------------

    if (
        product.stock < quantity
    ) {

        throw new Error(
            "Insufficient product stock"
        );

    }


    // --------------------------------------
    // Calculate total
    // --------------------------------------

    const unitPrice =
        Number(product.price);

    const totalAmount =
        unitPrice * quantity;


    // --------------------------------------
    // Insert order
    // --------------------------------------

    const [result] =
        await pool.query(

            `INSERT INTO orders
            (
                user_id,
                product_id,
                quantity,
                unit_price,
                total_amount,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'pending')`,

            [
                userId,
                productId,
                quantity,
                unitPrice,
                totalAmount
            ]

        );


    return {

        id: result.insertId,

        user_id: userId,

        product_id: productId,

        quantity,

        unit_price: unitPrice,

        total_amount: totalAmount,

        status: "pending"

    };

}


// ==========================================
// GET MY ORDERS
// ==========================================

async function getOrdersByUser(
    userId
) {

    const [rows] =
        await pool.query(

            `SELECT *
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC`,

            [userId]

        );


    return rows;

}


// ==========================================
// COMPLETE ORDER
// ==========================================

async function completeOrder(
    orderId,
    userId
) {

    const [result] =
        await pool.query(

            `UPDATE orders
             SET status = 'completed'
             WHERE id = ?
             AND user_id = ?
             AND status = 'pending'`,

            [
                orderId,
                userId
            ]

        );


    if (
        result.affectedRows === 0
    ) {

        return null;

    }


    const [rows] =
        await pool.query(

            `SELECT *
             FROM orders
             WHERE id = ?
             AND user_id = ?`,

            [
                orderId,
                userId
            ]

        );


    return rows[0];

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createOrder,

    getOrdersByUser,

    completeOrder

};