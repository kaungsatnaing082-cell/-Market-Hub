document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const centerSearch =
        document.getElementById("centerSearch");

    const centerStatus =
        document.getElementById("centerStatus");

    const centerRows =
        document.getElementById("centerRows");


    /* =========================================================
       STATE
    ========================================================= */

    let centers = [];


    /* =========================================================
       CHECK REQUIRED ELEMENTS
    ========================================================= */

    if (!centerRows) {

        console.error(
            "Admin Centers: #centerRows was not found."
        );

        return;
    }


    /* =========================================================
       LOAD CENTERS
    ========================================================= */

    async function loadCenters() {

        centerRows.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty"
                >
                    Loading centers...
                </td>
            </tr>
        `;


        try {

            const result =
                await KrestAPI(
                    "/admin/centers"
                );


            console.log(
                "Admin centers response:",
                result
            );


            /* =================================================
               SUPPORT DIFFERENT RESPONSE SHAPES
            ================================================= */

            if (
                Array.isArray(
                    result.centers
                )
            ) {

                centers =
                    result.centers;

            } else if (
                Array.isArray(
                    result?.data?.centers
                )
            ) {

                centers =
                    result?.data?.centers;

            } else if (
                Array.isArray(
                    result?.data
                )
            ) {

                centers =
                    result.data;

            } else {

                centers = [];
            }


            render();


        } catch (error) {

            console.error(
                "Unable to load admin centers:",
                error
            );


            centerRows.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty"
                    >
                        ${escapeHtml(
                            error.message ||
                            "Unable to load centers."
                        )}
                    </td>
                </tr>
            `;
        }
    }


    /* =========================================================
       RENDER
    ========================================================= */

    function render() {

        const query =
            String(
                centerSearch.value || ""
            )
            .trim()
            .toLowerCase();


        const selectedStatus =
            String(
                centerStatus.value || ""
            )
            .trim()
            .toUpperCase();


        const filtered =
            centers.filter(
                center => {

                    /* =========================================
                       SEARCH
                    ========================================== */

                    const searchableText = [
                            center.name,
                            center.seller_name,
                            center.category,
                            center.location
                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    const matchesSearch = !query ||
                        searchableText.includes(
                            query
                        );


                    /* =========================================
                       STATUS
                    ========================================== */

                    const centerState =
                        String(
                            center.status || ""
                        )
                        .trim()
                        .toUpperCase();


                    const matchesStatus = !selectedStatus ||
                        centerState ===
                        selectedStatus;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        /* =====================================================
           EMPTY
        ====================================================== */

        if (!filtered.length) {

            centerRows.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty"
                    >
                        No centers found.
                    </td>
                </tr>
            `;

            return;
        }


        /* =====================================================
           CENTER ROWS
        ====================================================== */

        centerRows.innerHTML =
            filtered
            .map(
                center => {

                    return `
                            <tr>

                                <!-- ===========================
                                     CENTER
                                ============================ -->

                                <td>

                                    <strong>
                                        ${escapeHtml(
                                            center.name ||
                                            "Unnamed Center"
                                        )}
                                    </strong>

                                    <div class="muted">
                                        ${escapeHtml(
                                            center.location ||
                                            "—"
                                        )}
                                    </div>

                                </td>


                                <!-- ===========================
                                     SELLER
                                ============================ -->

                                <td>
                                    ${escapeHtml(
                                        center.seller_name ||
                                        "—"
                                    )}
                                </td>


                                <!-- ===========================
                                     CATEGORY
                                ============================ -->

                                <td>
                                    ${escapeHtml(
                                        center.category ||
                                        "—"
                                    )}
                                </td>


                                <!-- ===========================
                                     PRODUCTS
                                ============================ -->

                                <td>
                                    ${Number(
                                        center.product_count ||
                                        0
                                    ).toLocaleString()}
                                </td>


                                <!-- ===========================
                                     WARNINGS
                                ============================ -->

                                <td>
                                    ${Number(
                                        center.warning_count ||
                                        0
                                    ).toLocaleString()}
                                </td>


                                <!-- ===========================
                                     STATUS
                                ============================ -->

                                <td>
                                    ${renderBadge(
                                        center.status
                                    )}
                                </td>


                                <!-- ===========================
                                     ACTION
                                ============================ -->

                                <td>

                                    <a
                                        class="btn btn-secondary"
                                        href="/pages/admin/center-detail.html?id=${encodeURIComponent(
                                            center.id
                                        )}"
                                    >
                                        Manage
                                    </a>

                                </td>

                            </tr>
                        `;
                }
            )
            .join("");
    }


    /* =========================================================
       STATUS BADGE
    ========================================================= */

    function renderBadge(status) {

        if (
            window.KrestUI &&
            typeof KrestUI.badge ===
            "function"
        ) {

            return KrestUI.badge(
                status
            );
        }


        return `
            <span>
                ${escapeHtml(
                    status || "—"
                )}
            </span>
        `;
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(value) {

        if (
            window.KrestUI &&
            typeof KrestUI.escape ===
            "function"
        ) {

            return KrestUI.escape(
                value
            );
        }


        return String(
                value || ""
            )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =========================================================
       EVENTS
    ========================================================= */

    if (centerSearch) {

        centerSearch.addEventListener(
            "input",
            render
        );
    }


    if (centerStatus) {

        centerStatus.addEventListener(
            "change",
            render
        );
    }


    /* =========================================================
       START
    ========================================================= */

    loadCenters();

});