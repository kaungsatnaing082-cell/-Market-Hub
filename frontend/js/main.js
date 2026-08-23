document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       MOBILE NAVIGATION
    ====================================================== */

    const menuButton =
        document.querySelector(
            "[data-menu-toggle]"
        );

    const navLinks =
        document.querySelector(
            ".nav-links"
        );


    function setMenuOpen(open) {

        navLinks.classList.toggle(
            "open",
            open
        );

        document.body.classList.toggle(
            "menu-open",
            open
        );

        menuButton.setAttribute(
            "aria-expanded",
            String(open)
        );
    }


    /* Initial state */

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );


    /* Menu button click */

    menuButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            const isOpen =
                navLinks.classList.contains(
                    "open"
                );

            setMenuOpen(!isOpen);
        }
    );


    /* Link click -> close */

    navLinks

        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {
                    setMenuOpen(false);
                }
            );
        });


    /* Outside click -> close */

    document.addEventListener(
        "click",
        (event) => {

            if (!navLinks.classList.contains(
                    "open"
                )) {
                return;
            }


            if (
                navLinks.contains(
                    event.target
                ) ||
                menuButton.contains(
                    event.target
                )
            ) {
                return;
            }


            setMenuOpen(false);
        }
    );


    /* ESC -> close */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {
                setMenuOpen(false);
            }
        }
    );


    /* Desktop ပြန်ရောက်ရင် menu ပိတ် */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                980
            ) {
                setMenuOpen(false);
            }
        }
    );


    /* =====================================================
       COUNTER ANIMATION
       Existing flow မပြောင်းထား
    ====================================================== */

    document
        .querySelectorAll(
            "[data-count]"
        )
        .forEach((element) => {

            const target =
                Number(
                    element.dataset.count ||
                    0
                );


            let current = 0;


            const step =
                Math.max(
                    1,
                    Math.ceil(
                        target / 40
                    )
                );


            const timer =
                setInterval(
                    () => {

                        current =
                            Math.min(
                                target,
                                current +
                                step
                            );


                        element.textContent =
                            current.toLocaleString() +
                            (
                                element.dataset.suffix ||
                                ""
                            );


                        if (
                            current >=
                            target
                        ) {
                            clearInterval(
                                timer
                            );
                        }

                    },
                    25
                );
        });
});