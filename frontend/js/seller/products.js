document.addEventListener("DOMContentLoaded", () => {
            "use strict";

            console.log("✅ seller/products.js loaded");

            /* =========================================================
               ELEMENTS
            ========================================================= */

            const productRows =
                document.getElementById("productRows");

            const productSearch =
                document.getElementById("productSearch");

            const productStatus =
                document.getElementById("productStatus");

            const message =
                document.getElementById("message");


            /* =========================================================
               STATE
            ========================================================= */

            let products = [];


            /* =========================================================
               REQUIRED ELEMENT CHECK
            ========================================================= */

            if (!productRows) {
                console.error(
                    "❌ #productRows not found in products.html"
                );

                return;
            }


            /* =========================================================
               LOAD PRODUCTS
            ========================================================= */

            async function loadProducts() {
                productRows.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty"
                >
                    Loading products...
                </td>
            </tr>
        `;

                try {
                    console.log(
                        "📡 Loading /api/seller/products..."
                    );

                    const result =
                        await KrestAPI(
                            "/seller/products"
                        );

                    console.log(
                        "✅ Seller products response:",
                        result
                    );


                    /* =================================================
                       RESPONSE CHECK
                    ================================================= */

                    if (
                        Array.isArray(
                            result.products
                        )
                    ) {
                        products =
                            result.products;

                    } else if (
                        Array.isArray(
                            result?.data?.products
                        )
                    ) {
                        products =
                            result?.data?.products;

                    } else if (
                        Array.isArray(
                            result?.data
                        )
                    ) {
                        products =
                            result.data;

                    } else {
                        products = [];
                    }


                    renderProducts();

                } catch (error) {
                    console.error(
                        "❌ Product loading error:",
                        error
                    );

                    productRows.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty"
                    >
                        ${escapeHtml(
                            error.message ||
                            "Unable to load products."
                        )}
                    </td>
                </tr>
            `;
                }
            }


            /* =========================================================
               RENDER PRODUCTS
            ========================================================= */

            function renderProducts() {
                const query =
                    String(
                        productSearch.value || ""
                    )
                    .trim()
                    .toLowerCase();


                const status =
                    String(
                        productStatus.value || ""
                    )
                    .trim()
                    .toUpperCase();


                const filteredProducts =
                    products.filter(
                        product => {
                            const searchText = [
                                    product.name,
                                    product.category,
                                    product.sku
                                ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                            const matchesSearch = !query ||
                                searchText.includes(
                                    query
                                );


                            const productState =
                                String(
                                    product.status || ""
                                )
                                .trim()
                                .toUpperCase();


                            const matchesStatus = !status ||
                                productState ===
                                status;


                            return (
                                matchesSearch &&
                                matchesStatus
                            );
                        }
                    );


                /* =====================================================
                   EMPTY STATE
                ====================================================== */

                if (
                    filteredProducts.length ===
                    0
                ) {
                    productRows.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty"
                    >
                        ${
                            products.length
                                ? "No matching products."
                                : "No products yet. Click Add Product to create your first product."
                        }
                    </td>
                </tr>
            `;

                    return;
                }


                /* =====================================================
                   PRODUCT ROWS
                ====================================================== */

                productRows.innerHTML =
                    filteredProducts
                    .map(
                        product => {
                            const variantCount =
                                Number(
                                    product.variant_count ||
                                    0
                                );


                            const priceHtml =
                                getPriceDisplay(
                                    product
                                );


                            return `
                            <tr>

                                <!-- ===========================
                                     PRODUCT
                                ============================ -->

                                <td>

                                    <div
                                        style="
                                            display:flex;
                                            align-items:center;
                                            gap:12px;
                                        "
                                    >

                                        ${
                                            product.image_url

                                                ? `
                                                    <img
                                                        src="${escapeAttribute(
                                                            product.image_url
                                                        )}"
                                                        alt="${escapeAttribute(
                                                            product.name ||
                                                            "Product"
                                                        )}"
                                                        style="
                                                            width:52px;
                                                            height:52px;
                                                            object-fit:cover;
                                                            border-radius:10px;
                                                            flex-shrink:0;
                                                        "
                                                    />
                                                `

                                                : `
                                                    <div
                                                        style="
                                                            width:52px;
                                                            height:52px;
                                                            display:grid;
                                                            place-items:center;
                                                            border-radius:10px;
                                                            background:#f1f5f9;
                                                            font-size:1.5rem;
                                                            flex-shrink:0;
                                                        "
                                                    >
                                                        📦
                                                    </div>
                                                `
                                        }


                                        <div>

                                            <strong>
                                                ${escapeHtml(
                                                    product.name ||
                                                    "Unnamed product"
                                                )}
                                            </strong>


                                            <div class="muted">

                                                ${
                                                    product.sku

                                                        ? `SKU: ${escapeHtml(
                                                            product.sku
                                                        )}`

                                                        : "No SKU"
                                                }

                                            </div>


                                            ${
                                                variantCount > 0

                                                    ? `
                                                        <div
                                                            class="muted"
                                                            style="
                                                                margin-top:3px;
                                                                font-size:.78rem;
                                                            "
                                                        >
                                                            ${variantCount}
                                                            variant${
                                                                variantCount === 1
                                                                    ? ""
                                                                    : "s"
                                                            }
                                                        </div>
                                                    `

                                                    : ""
                                            }

                                        </div>

                                    </div>

                                </td>


                                <!-- ===========================
                                     CATEGORY
                                ============================ -->

                                <td>
                                    ${escapeHtml(
                                        product.category ||
                                        "—"
                                    )}
                                </td>


                                <!-- ===========================
                                     PRICE
                                ============================ -->

                                <td>
                                    ${priceHtml}
                                </td>


                                <!-- ===========================
                                     STOCK
                                ============================ -->

                                <td>
                                    ${renderStock(
                                        product.stock
                                    )}
                                </td>


                                <!-- ===========================
                                     STATUS
                                ============================ -->

                                <td>
                                    ${renderBadge(
                                        product.status
                                    )}
                                </td>


                                <!-- ===========================
                                     ACTIONS
                                ============================ -->

                                <td>

                                    <div
                                        class="actions"
                                        style="
                                            display:flex;
                                            gap:8px;
                                            flex-wrap:wrap;
                                        "
                                    >

                                        <a
                                            class="btn btn-secondary"
                                            href="/pages/seller/product-detail.html?id=${encodeURIComponent(
                                                product.id
                                            )}"
                                        >
                                            View
                                        </a>


                                        <a
                                            class="btn btn-primary"
                                            href="/pages/seller/edit-product.html?id=${encodeURIComponent(
                                                product.id
                                            )}"
                                        >
                                            Edit
                                        </a>

                                    </div>

                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");
    }


    /* =========================================================
       PRICE DISPLAY
    ========================================================= */

    function getPriceDisplay(
        product
    ) {
        const variantCount =
            Number(
                product.variant_count ||
                0
            );


        if (
            variantCount > 0 &&
            product.min_variant_price !==
                null &&
            product.min_variant_price !==
                undefined
        ) {
            const min =
                Number(
                    product.min_variant_price
                );

            const max =
                Number(
                    product.max_variant_price ??
                    product.min_variant_price
                );


            if (
                Number.isFinite(min) &&
                Number.isFinite(max)
            ) {
                if (min === max) {
                    return `
                        <strong>
                            ${escapeHtml(
                                formatMoney(min)
                            )}
                        </strong>
                    `;
                }


                return `
                    <strong>
                        ${escapeHtml(
                            formatMoney(min)
                        )}
                    </strong>

                    <div
                        class="muted"
                        style="
                            font-size:.78rem;
                            margin-top:3px;
                        "
                    >
                        to
                        ${escapeHtml(
                            formatMoney(max)
                        )}
                    </div>
                `;
            }
        }


        return `
            <strong>
                ${escapeHtml(
                    formatMoney(
                        product.price
                    )
                )}
            </strong>
        `;
    }


    /* =========================================================
       STOCK
    ========================================================= */

    function renderStock(
        value
    ) {
        const stock =
            Number(
                value || 0
            );


        if (stock <= 0) {
            return `
                <span
                    style="
                        color:#b91c1c;
                        font-weight:800;
                    "
                >
                    Out of stock
                </span>
            `;
        }


        if (stock <= 5) {
            return `
                <span
                    style="
                        color:#b45309;
                        font-weight:800;
                    "
                >
                    ${stock} left
                </span>
            `;
        }


        return `
            <strong>
                ${stock.toLocaleString(
                    "en-US"
                )}
            </strong>
        `;
    }


    /* =========================================================
       STATUS BADGE
    ========================================================= */

    function renderBadge(
        status
    ) {
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
       MONEY
    ========================================================= */

    function formatMoney(
        value
    ) {
        if (
            window.KrestUI &&
            typeof KrestUI.money ===
                "function"
        ) {
            return KrestUI.money(
                value
            );
        }


        return (
            Number(
                value || 0
            ).toLocaleString(
                "en-US",
                {
                    maximumFractionDigits:
                        0
                }
            ) +
            " MMK"
        );
    }


    /* =========================================================
       ESCAPE
    ========================================================= */

    function escapeHtml(
        value
    ) {
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
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function escapeAttribute(
        value
    ) {
        return escapeHtml(
            value
        );
    }


    /* =========================================================
       EVENTS
    ========================================================= */

    productSearch?.addEventListener(
        "input",
        renderProducts
    );


    productStatus?.addEventListener(
        "change",
        renderProducts
    );


    /* =========================================================
       START
    ========================================================= */

    loadProducts();
});