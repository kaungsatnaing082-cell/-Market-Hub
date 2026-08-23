document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    /* =====================================================
       ACTIVE SIDEBAR LINK
    ====================================================== */

    const currentPath =
        location.pathname.replace(/\/$/, "");

    sidebar
        .querySelectorAll(".side-link")
        .forEach((link) => {

            const linkPath =
                new URL(
                    link.href,
                    location.origin
                )
                .pathname
                .replace(/\/$/, "");

            if (linkPath === currentPath) {
                link.classList.add("active");
            }
        });


    /* =====================================================
       CREATE SIDEBAR OVERLAY
    ====================================================== */

    let overlay =
        document.querySelector(
            ".sidebar-overlay"
        );

    if (!overlay) {

        overlay =
            document.createElement(
                "button"
            );

        overlay.className =
            "sidebar-overlay";

        overlay.type =
            "button";

        overlay.setAttribute(
            "aria-label",
            "Close navigation"
        );

        document.body.appendChild(
            overlay
        );
    }


    /* =====================================================
       SIDEBAR TOGGLE
    ====================================================== */

    const toggle =
        document.querySelector(
            "[data-sidebar-toggle]"
        );


    function setSidebarOpen(open) {

        sidebar.classList.toggle(
            "open",
            open
        );

        overlay.classList.toggle(
            "open",
            open
        );

        document.body.classList.toggle(
            "sidebar-open",
            open
        );

        toggle.setAttribute(
            "aria-expanded",
            String(open)
        );
    }


    function closeSidebar() {
        setSidebarOpen(false);
    }


    /* Overlay click */
    overlay.addEventListener(
        "click",
        closeSidebar
    );


    /* Link click */
    sidebar
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                closeSidebar
            );
        });


    /* Desktop ပြန်ရောက်ရင် close */
    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                1100
            ) {
                closeSidebar();
            }
        }
    );


    /* ESC key */
    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {
                closeSidebar();
            }
        }
    );
});


/* =========================================================
   GLOBAL CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    (event) => {

        /* =================================================
           SIDEBAR BUTTON
        ================================================= */

        const toggle =
            event.target.closest(
                "[data-sidebar-toggle]"
            );


        if (toggle) {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );

            const overlay =
                document.querySelector(
                    ".sidebar-overlay"
                );


            const shouldOpen = !sidebar.classList.contains(
                "open"
            );


            sidebar.classList.toggle(
                "open",
                shouldOpen
            );


            overlay.classList.toggle(
                "open",
                shouldOpen
            );


            document.body.classList.toggle(
                "sidebar-open",
                shouldOpen
            );


            toggle.setAttribute(
                "aria-expanded",
                String(shouldOpen)
            );
        }


        /* =================================================
           LOGOUT
        ================================================= */

        const logout =
            event.target.closest(
                "[data-logout]"
            );


        if (logout) {

            KrestStorage.clearAuth();

            location.href =
                "/pages/auth/login.html";
        }
    }
);