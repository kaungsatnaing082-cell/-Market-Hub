/* =========================================================
   KREST CENTER - BUYER CATEGORIES
========================================================= */

const defaultCategories = [{
        name: "Electronic",
        icon: "💻"
    },
    {
        name: "Fashion",
        icon: "👕"
    },
    {
        name: "Beauty",
        icon: "💄"
    },
    {
        name: "Home & Living",
        icon: "🏠"
    },
    {
        name: "Sports",
        icon: "🏃"
    },
    {
        name: "Food & Beverage",
        icon: "🍔"
    },
    {
        name: "Books",
        icon: "📚"
    },
    {
        name: "Toys & Games",
        icon: "🎮"
    },
    {
        name: "Health & Personal Care",
        icon: "🧴"
    },
    {
        name: "Automotive",
        icon: "🚗"
    },
    {
        name: "Accessories",
        icon: "🎒"
    },
    {
        name: "Other",
        icon: "🛍️"
    }
];


/* =========================================================
   EXTRA ICONS
========================================================= */

const categoryIcons = {
    Electronic: "💻",
    Electronics: "💻",

    Fashion: "👕",

    Beauty: "💄",

    "Home & Living": "🏠",
    Home: "🏠",

    Sports: "🏃",

    "Food & Beverage": "🍔",
    Food: "🍔",

    Books: "📚",

    "Toys & Games": "🎮",
    Toys: "🧸",

    "Health & Personal Care": "🧴",
    Health: "🩺",

    Automotive: "🚗",

    Accessories: "🎒",

    Other: "🛍️",
    Others: "🛍️"
};


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async() => {
        const categoryGrid =
            document.getElementById("categoryGrid");

        if (!categoryGrid) {
            return;
        }

        categoryGrid.innerHTML = `
      <div class="panel">
        Loading categories...
      </div>
    `;

        try {
            const data =
                await KrestAPI(
                    "/marketplace/categories"
                );

            const apiCategories =
                Array.isArray(data.categories) ?
                data.categories : [];


            /* =====================================================
               API CATEGORY COUNT MAP
            ====================================================== */

            const countMap =
                new Map();

            apiCategories.forEach(
                (item) => {
                    const categoryName =
                        String(
                            item.category || ""
                        ).trim();

                    if (!categoryName) {
                        return;
                    }

                    countMap.set(
                        categoryName.toLowerCase(),
                        Number(
                            item.product_count || 0
                        )
                    );
                }
            );


            /* =====================================================
               BUILD DEFAULT CATEGORY LIST
            ====================================================== */

            const finalCategories =
                defaultCategories.map(
                    (category) => {
                        let productCount =
                            countMap.get(
                                category.name.toLowerCase()
                            ) || 0;


                        /*
                         * Compatibility:
                         * Electronic / Electronics
                         */
                        if (
                            category.name ===
                            "Electronic"
                        ) {
                            productCount =
                                countMap.get(
                                    "electronic"
                                ) ||
                                countMap.get(
                                    "electronics"
                                ) ||
                                0;
                        }


                        return {
                            name: category.name,

                            icon: category.icon,

                            productCount
                        };
                    }
                );


            /* =====================================================
               ADD DATABASE CATEGORIES THAT ARE NOT DEFAULT
            ====================================================== */

            apiCategories.forEach(
                (item) => {
                    const categoryName =
                        String(
                            item.category || ""
                        ).trim();

                    if (!categoryName) {
                        return;
                    }


                    const alreadyExists =
                        finalCategories.some(
                            (category) =>
                            category.name.toLowerCase() ===
                            categoryName.toLowerCase()
                        );


                    /*
                     * Treat Electronics as same as Electronic
                     */
                    const electronicAlias =
                        categoryName.toLowerCase() ===
                        "electronics" &&
                        finalCategories.some(
                            (category) =>
                            category.name.toLowerCase() ===
                            "electronic"
                        );


                    if (
                        alreadyExists ||
                        electronicAlias
                    ) {
                        return;
                    }


                    finalCategories.push({
                        name: categoryName,

                        icon: categoryIcons[
                            categoryName
                        ] || "🛍️",

                        productCount: Number(
                            item.product_count || 0
                        )
                    });
                }
            );


            /* =====================================================
               RENDER
            ====================================================== */

            categoryGrid.innerHTML =
                finalCategories
                .map(
                    (category) => {
                        const safeName =
                            KrestUI.escape(
                                category.name
                            );

                        const count =
                            Number(
                                category.productCount ||
                                0
                            );

                        const productText =
                            count === 1 ?
                            "product" :
                            "products";


                        return `
                <a
                  class="card category-card"
                  href="/pages/buyer/products.html?category=${encodeURIComponent(
                    category.name
                  )}"
                >
                  <div class="category-icon">
                    ${category.icon}
                  </div>

                  <strong>
                    ${safeName}
                  </strong>

                  <div class="muted">
                    ${count} ${productText}
                  </div>
                </a>
              `;
                    }
                )
                .join("");

        } catch (error) {

            /*
             * Even if API fails,
             * still show default categories.
             */
            categoryGrid.innerHTML =
                defaultCategories
                .map(
                    (category) => `
              <a
                class="card category-card"
                href="/pages/buyer/products.html?category=${encodeURIComponent(
                  category.name
                )}"
              >
                <div class="category-icon">
                  ${category.icon}
                </div>

                <strong>
                  ${KrestUI.escape(
                    category.name
                  )}
                </strong>

                <div class="muted">
                  0 products
                </div>
              </a>
            `
                )
                .join("");

            console.error(
                "Unable to load category counts:",
                error
            );
        }
    }
);