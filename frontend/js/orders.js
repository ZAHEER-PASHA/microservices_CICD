const token =
    localStorage.getItem("token");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!token) {

    window.location.replace(
        "/login.html"
    );
}


// ==========================================
// ELEMENTS
// ==========================================

const backToProducts =
    document.getElementById(
        "backToProducts"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const pendingOrders =
    document.getElementById(
        "pendingOrders"
    );

const completedOrders =
    document.getElementById(
        "completedOrders"
    );

const pendingMessage =
    document.getElementById(
        "pendingMessage"
    );

const completedMessage =
    document.getElementById(
        "completedMessage"
    );


// ==========================================
// BACK TO PRODUCTS
// ==========================================

if (backToProducts) {

    backToProducts.addEventListener(
        "click",
        () => {

            window.location.href =
                "/pages/products.html";
        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );
}


function logout() {

    // Remove authentication data
    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    // Go directly to login page
    window.location.replace(
        "/login.html"
    );
}


// ==========================================
// SESSION EXPIRED
// ==========================================

function handleSessionExpired() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    alert(
        "Your session has expired. Please login again."
    );


    window.location.replace(
        "/login.html"
    );
}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    try {

        const response =
            await fetch(
                "/api/orders/my",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Orders API response:",
            data
        );


        // ==================================
        // 401 = SESSION EXPIRED
        // ==================================

        if (
            response.status === 401
        ) {

            handleSessionExpired();

            return;
        }


        // ==================================
        // 403 = FORBIDDEN
        // DO NOT LOGOUT
        // ==================================

        if (
            response.status === 403
        ) {

            pendingMessage.textContent =
                data.message ||
                "You do not have permission to view orders.";

            completedMessage.textContent =
                "";

            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            pendingMessage.textContent =
                data.message ||
                "Failed to load orders.";

            completedMessage.textContent =
                "";

            return;
        }


        // ==================================
        // CLEAR PREVIOUS CONTENT
        // ==================================

        pendingOrders.innerHTML =
            "";

        completedOrders.innerHTML =
            "";


        // ==================================
        // FILTER ORDERS
        // ==================================

        const pending =
            data.orders.filter(
                order =>
                    order.status ===
                    "pending"
            );


        const completed =
            data.orders.filter(
                order =>
                    order.status ===
                    "completed"
            );


        // ==================================
        // PENDING ORDERS
        // ==================================

        if (
            pending.length === 0
        ) {

            pendingMessage.textContent =
                "No pending orders.";

        } else {

            pendingMessage.textContent =
                "Click an order to mark it as completed.";


            pending.forEach(
                order => {

                    const card =
                        createOrderCard(
                            order,
                            true
                        );


                    pendingOrders.appendChild(
                        card
                    );
                }
            );
        }


        // ==================================
        // COMPLETED ORDERS
        // ==================================

        if (
            completed.length === 0
        ) {

            completedMessage.textContent =
                "No completed orders.";

        } else {

            completedMessage.textContent =
                "";


            completed.forEach(
                order => {

                    const card =
                        createOrderCard(
                            order,
                            false
                        );


                    completedOrders.appendChild(
                        card
                    );
                }
            );
        }


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        pendingMessage.textContent =
            "Unable to load orders.";

        completedMessage.textContent =
            "";
    }
}


// ==========================================
// CREATE ORDER CARD
// ==========================================

function createOrderCard(
    order,
    clickable
) {

    const card =
        document.createElement(
            "div"
        );


    card.style.border =
        "1px solid #ccc";

    card.style.padding =
        "15px";

    card.style.margin =
        "10px 0";

    card.style.borderRadius =
        "8px";


    if (clickable) {

        card.style.cursor =
            "pointer";

        card.title =
            "Click to complete this order";
    }


    card.innerHTML = `

        <h3>
            Order #${order.id}
        </h3>

        <p>
            <strong>Total:</strong>
            &#8377;${Number(
                order.total_amount
            ).toFixed(2)}
        </p>

        <p>
            <strong>Status:</strong>
            ${order.status}
        </p>

        ${
            clickable
                ? `
                    <p>
                        <strong>
                            Click this order
                            to complete it
                        </strong>
                    </p>
                  `
                : ""
        }

    `;


    // ======================================
    // CLICK PENDING ORDER
    // ======================================

    if (clickable) {

        card.addEventListener(
            "click",
            () => {

                completeOrder(
                    order.id
                );
            }
        );
    }


    return card;
}


// ==========================================
// COMPLETE ORDER
// ==========================================

async function completeOrder(
    orderId
) {

    const confirmOrder =
        confirm(
            `Mark Order #${orderId} as completed?`
        );


    if (!confirmOrder) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/orders/${orderId}/complete`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Complete order response:",
            data
        );


        // ==================================
        // 401 = SESSION EXPIRED
        // ==================================

        if (
            response.status === 401
        ) {

            handleSessionExpired();

            return;
        }


        // ==================================
        // 403 = FORBIDDEN
        // ==================================

        if (
            response.status === 403
        ) {

            alert(
                data.message ||
                "You do not have permission to complete this order."
            );

            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Failed to complete order."
            );

            return;
        }


        alert(
            "Order completed successfully!"
        );


        // Reload orders
        loadOrders();


    } catch (error) {

        console.error(
            "Complete order error:",
            error
        );


        alert(
            "Unable to complete order."
        );
    }
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadOrders();