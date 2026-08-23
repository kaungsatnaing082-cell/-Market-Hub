(() => {
    "use strict";

    /* =========================================================
       SELLER PAGE GUARD
    ========================================================= */

    const user =
        window.KrestStorage.getUser();

    const token =
        window.KrestStorage.getToken();


    /* =========================================================
       CHECK LOGIN
    ========================================================= */

    if (!user || !token) {

        window.location.replace(
            "/pages/auth/login.html"
        );

        return;
    }


    /* =========================================================
       CHECK ROLE
       Supports:
       SELLER
       seller
       Seller
    ========================================================= */

    const role =
        String(
            user.role || ""
        )
        .trim()
        .toUpperCase();


    if (role !== "SELLER") {

        /*
         * Do not delete the login session here.
         * The user may simply belong to another role.
         */

        if (role === "BUYER") {

            window.location.replace(
                "/pages/buyer/dashboard.html"
            );

            return;
        }


        if (role === "ADMIN") {

            window.location.replace(
                "/pages/admin/dashboard.html"
            );

            return;
        }


        window.location.replace(
            "/pages/auth/login.html"
        );

        return;
    }


    /* =========================================================
       SELLER AUTHENTICATED
    ========================================================= */

    console.log(
        "Seller session valid:", {
            id: user.id,
            role
        }
    );

})();