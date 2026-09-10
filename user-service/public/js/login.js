const form =
    document.getElementById(
        "loginForm"
    );


const message =
    document.getElementById(
        "message"
    );


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        message.textContent =
            "Logging in...";


        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email,

                                password

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Login failed";

                return;
            }


            // Store JWT
            localStorage.setItem(
                "token",
                data.token
            );


            // Store user
            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );


            message.textContent =
                "Login successful!";


            setTimeout(() => {

    if (data.user.role === "admin") {

        window.location.href =
            "http://localhost:8090/admin/admin.html";

    } else {

        window.location.href =
            "http://localhost:8090/pages/products.html";

    }

}, 500);


        } catch (error) {

            console.error(
                error
            );


            message.textContent =
                "Unable to connect to server";

        }

    }
);