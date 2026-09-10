// ==========================================
// ADMIN PRODUCT MANAGEMENT
// ==========================================

const PRODUCT_API = "/api/products";

// ==========================================
// AUTHENTICATION
// ==========================================

const token = localStorage.getItem("token");

let currentUser = {};

try {
    currentUser =
        JSON.parse(
            localStorage.getItem("user") || "{}"
        );
} catch (error) {
    currentUser = {};
}


// ==========================================
// AUTH CHECK
// ==========================================

// No token -> login page
if (!token) {

    window.location.href =
        "/login.html";

}

// Token exists but user is not admin
else if (currentUser.role !== "admin") {

    alert(
        "Admin access required."
    );

    window.location.href =
        "/pages/products.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const productTableBody =
    document.getElementById(
        "productTableBody"
    );

const productModal =
    document.getElementById(
        "productModal"
    );

const productForm =
    document.getElementById(
        "productForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const productId =
    document.getElementById(
        "productId"
    );

const nameInput =
    document.getElementById(
        "name"
    );

const descriptionInput =
    document.getElementById(
        "description"
    );

const priceInput =
    document.getElementById(
        "price"
    );

const stockInput =
    document.getElementById(
        "stock"
    );

const categoryInput =
    document.getElementById(
        "category"
    );

const imageUrlInput =
    document.getElementById(
        "imageUrl"
    );

const message =
    document.getElementById(
        "message"
    );


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        productTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Loading products...
                </td>
            </tr>
        `;


        const response =
            await fetch(
                PRODUCT_API,
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


        // ==================================
        // ONLY 401 MEANS SESSION PROBLEM
        // ==================================

        if (response.status === 401) {

            handleSessionExpired();

            return;
        }


        // ==================================
        // 403 = FORBIDDEN
        // DO NOT LOGOUT
        // ==================================

        if (response.status === 403) {

            showMessage(
                data.message ||
                "You do not have permission to perform this action.",
                "error"
            );

            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to load products"
            );
        }


        displayProducts(
            data.products || []
        );


    } catch (error) {

        console.error(
            "Load products error:",
            error
        );


        productTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load products.
                    <br>
                    ${escapeHtml(
                        error.message
                    )}
                </td>
            </tr>
        `;
    }
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(
    products
) {

    productTableBody.innerHTML =
        "";


    if (
        products.length === 0
    ) {

        productTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }


    products.forEach(
        product => {

            const row =
                document.createElement(
                    "tr"
                );


            const image =
                product.image_url ||
                "https://via.placeholder.com/60?text=No+Image";


            row.innerHTML = `

                <td>
                    ${product.id}
                </td>

                <td>
                    <img
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(
                            product.name
                        )}"
                        class="product-image"
                        onerror="
                            this.src='https://via.placeholder.com/60?text=No+Image'
                        "
                    >
                </td>

                <td>
                    ${escapeHtml(
                        product.name
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        product.category ||
                        "General"
                    )}
                </td>

                <td>
                    ₹${Number(
                        product.price
                    ).toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits:
                                2,

                            maximumFractionDigits:
                                2
                        }
                    )}
                </td>

                <td>
                    ${product.stock}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="
                            editProduct(
                                ${product.id}
                            )
                        "
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="
                            deleteProduct(
                                ${product.id}
                            )
                        "
                    >
                        Delete
                    </button>

                </td>
            `;


            productTableBody.appendChild(
                row
            );
        }
    );
}


// ==========================================
// OPEN ADD PRODUCT MODAL
// ==========================================

document
    .getElementById(
        "addProductBtn"
    )
    .addEventListener(
        "click",
        () => {

            openAddModal();

        }
    );


function openAddModal() {

    modalTitle.textContent =
        "Add Product";


    productForm.reset();


    productId.value =
        "";


    productModal.classList.remove(
        "hidden"
    );
}


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(
    id
) {

    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${id}`,
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


        // 401 = session expired
        if (
            response.status === 401
        ) {

            handleSessionExpired();

            return;
        }


        // 403 = forbidden
        if (
            response.status === 403
        ) {

            showMessage(
                data.message ||
                "Admin access required.",
                "error"
            );

            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to load product"
            );
        }


        const product =
            data.product;


        modalTitle.textContent =
            "Edit Product";


        productId.value =
            product.id;


        nameInput.value =
            product.name || "";


        descriptionInput.value =
            product.description || "";


        priceInput.value =
            product.price || "";


        stockInput.value =
            product.stock || 0;


        categoryInput.value =
            product.category || "";


        imageUrlInput.value =
            product.image_url || "";


        productModal.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );
    }
}


// ==========================================
// SAVE PRODUCT
// ADD OR UPDATE
// ==========================================

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const id =
            productId.value;


        const productData = {

            name:
                nameInput.value.trim(),

            description:
                descriptionInput.value.trim(),

            price:
                Number(
                    priceInput.value
                ),

            stock:
                Number(
                    stockInput.value
                ),

            category:
                categoryInput.value.trim(),

            image_url:
                imageUrlInput.value.trim() ||
                null
        };


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !productData.name ||
            !productData.description ||
            !productData.category
        ) {

            showMessage(
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        if (
            productData.price < 0 ||
            productData.stock < 0
        ) {

            showMessage(
                "Price and stock cannot be negative.",
                "error"
            );

            return;
        }


        try {

            const isEdit =
                Boolean(id);


            const url =
                isEdit
                    ? `${PRODUCT_API}/${id}`
                    : PRODUCT_API;


            const method =
                isEdit
                    ? "PUT"
                    : "POST";


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body:
                            JSON.stringify(
                                productData
                            )
                    }
                );


            const data =
                await response.json();


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

                showMessage(
                    data.message ||
                    "Admin access required.",
                    "error"
                );

                return;
            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Failed to save product"
                );
            }


            closeModal();


            showMessage(
                isEdit
                    ? "Product updated successfully."
                    : "Product created successfully.",
                "success"
            );


            await loadProducts();

        } catch (error) {

            console.error(
                "Save product error:",
                error
            );


            showMessage(
                error.message,
                "error"
            );
        }
    }
);


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(
    id
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete product #${id}?`
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        // 401 = session expired
        if (
            response.status === 401
        ) {

            handleSessionExpired();

            return;
        }


        // 403 = forbidden
        if (
            response.status === 403
        ) {

            showMessage(
                data.message ||
                "Admin access required.",
                "error"
            );

            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to delete product"
            );
        }


        showMessage(
            "Product deleted successfully.",
            "success"
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );
    }
}


// ==========================================
// CLOSE MODAL
// ==========================================

document
    .getElementById(
        "closeModalBtn"
    )
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById(
        "cancelBtn"
    )
    .addEventListener(
        "click",
        closeModal
    );


function closeModal() {

    productModal.classList.add(
        "hidden"
    );


    productForm.reset();


    productId.value =
        "";
}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

productModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            productModal
        ) {

            closeModal();
        }
    }
);


// ==========================================
// BACK TO PRODUCTS
// ==========================================

document
    .getElementById(
        "backToProducts"
    )
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "/pages/products.html";
        }
    );


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById(
        "logoutBtn"
    )
    .addEventListener(
        "click",
        logout
    );


function logout() {

    // Remove authentication data
    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    // IMPORTANT:
    // Go to LOGIN page, NOT "/"
    window.location.href =
        "/login.html";
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


    window.location.href =
        "/login.html";
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.style.display =
        "block";


    if (
        type === "success"
    ) {

        message.style.background =
            "#dcfce7";

        message.style.color =
            "#166534";

    } else {

        message.style.background =
            "#fee2e2";

        message.style.color =
            "#991b1b";
    }


    setTimeout(
        () => {

            message.style.display =
                "none";

        },
        4000
    );
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


// ==========================================
// INITIAL LOAD
// ==========================================

// Only load products if user is admin
if (
    token &&
    currentUser.role === "admin"
) {

    loadProducts();
}