
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");


// ==========================================
// REGISTER
// ==========================================

async function register(req, res) {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        const normalizedEmail =
            email.toLowerCase().trim();


        // Check existing user
        const [existingUsers] =
            await pool.execute(
                "SELECT id FROM users WHERE email = ?",
                [normalizedEmail]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Email is already registered"

            });
        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 12);


        // New users are always customers
        const role = "customer";


        // Insert user
        const [result] =
            await pool.execute(

                `INSERT INTO users
                (name, email, password, role)
                VALUES (?, ?, ?, ?)`,

                [
                    name.trim(),
                    normalizedEmail,
                    hashedPassword,
                    role
                ]
            );


        return res.status(201).json({

            success: true,

            message:
                "User registered successfully",

            user: {

                id: result.insertId,

                name: name.trim(),

                email: normalizedEmail,

                role: role

            }
        });


    } catch (error) {

        console.error(
            "Register error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });
    }
}


// ==========================================
// LOGIN
// ==========================================

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        const normalizedEmail =
            email.toLowerCase().trim();


        // Find user
        const [users] =
            await pool.execute(

                `SELECT
                    id,
                    name,
                    email,
                    password,
                    role
                 FROM users
                 WHERE email = ?`,

                [normalizedEmail]
            );


        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });
        }


        const user = users[0];


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });
        }


        // Generate JWT
        const token =
            jwt.sign(

                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN ||
                        "1h"
                }
            );


        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });
    }
}


// ==========================================
// PROFILE
// ==========================================

async function getProfile(req, res) {

    try {

        const userId =
            req.user.userId;


        const [users] =
            await pool.execute(

                `SELECT
                    id,
                    name,
                    email,
                    role,
                    created_at
                 FROM users
                 WHERE id = ?`,

                [userId]
            );


        if (users.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });
        }


        return res.status(200).json({

            success: true,

            user: users[0]

        });


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });
    }
}


module.exports = {

    register,

    login,

    getProfile

};

