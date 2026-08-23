/* =========================================================
   KREST CENTER - BUYER PRODUCTS
========================================================= */

const DEFAULT_CATEGORIES = [
    "Electronic",
    "Fashion",
    "Beauty",
    "Home & Living",
    "Sports",
    "Food & Beverage",
    "Books",
    "Toys & Games",
    "Health & Personal Care",
    "Automotive",
    "Accessories",
    "Other"
];


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {
    const q =
        document.getElementById("q");

    const category =
        document.getElementById("category");

    const minPrice =
        document.getElementById("minPrice");

    const maxPrice =
        document.getElementById("maxPrice");

    const sort =
        document.getElementById("sort");

    const productGrid =
        document.getElementById("productGrid");

    const resultCount =
        document.getElementById("resultCount");


    const params =
        new URLSearchParams();


    /* =========================================================
       SEARCH
    ========================================================= */

    if (q.value.trim()) {
        params.set(
            "q",
            q.value.trim()
        );
    }


    /* =========================================================
       CATEGORY
    ========================================================= */

    if (category.value) {
        params.set(
            "category",
            category.value
        );
    }


    /* =========================================================
       PRICE FILTER
    ========================================================= */

    if (minPrice.value) {
        params.set(
            "minPrice",
            minPrice.value
        );
    }


    if (maxPrice.value) {
        params.set(
            "maxPrice",
            maxPrice.value
        );
    }


    /* =========================================================
       SORT
    ========================================================= */

    if (sort.value) {
        params.set(
            "sort",
            sort.value
        );
    }


    try {
        productGrid.innerHTML = `
      <div class="panel">
        Loading products...
      </div>
    `;


        const data =
            await KrestAPI(
                `/marketplace/products?${params.toString()}`
            );


        const products =
            Array.isArray(data.products) ?
            data.products :
            [];


        /* =======================================================
           RENDER PRODUCTS
        ======================================================== */

        productGrid.innerHTML =
            products.length ?
            products
            .map(
                BuyerUI.productCard
            )
            .join("") :
            `
            <div class="panel empty">
              No products match these filters.
            </div>
          `;


        /* =======================================================
           RESULT COUNT
        ======================================================== */

        resultCount.textContent =
            `${products.length} result${
        products.length === 1
          ? ""
          : "s"
      }`;


        /* =======================================================
           KEEP FILTERS IN URL
        ======================================================== */

        const browserParams =
            new URLSearchParams();

        if (q.value.trim()) {
            browserParams.set(
                "q",
                q.value.trim()
            );
        }

        if (category.value) {
            browserParams.set(
                "category",
                category.value
            );
        }

        if (minPrice.value) {
            browserParams.set(
                "minPrice",
                minPrice.value
            );
        }

        if (maxPrice.value) {
            browserParams.set(
                "maxPrice",
                maxPrice.value
            );
        }

        if (sort.value) {
            browserParams.set(
                "sort",
                sort.value
            );
        }


        const newUrl =
            browserParams.toString() ?
            `${location.pathname}?${browserParams.toString()}` :
            location.pathname;


        history.replaceState(
            null,
            "",
            newUrl
        );

    } catch (error) {
        productGrid.innerHTML = `
      <div class="notice error">
        ${KrestUI.escape(
          error.message ||
            "Unable to load products."
        )}
      </div>
    `;

        resultCount.textContent =
            "0 results";
    }
}


/* =========================================================
   LOAD CATEGORY OPTIONS
========================================================= */

async function loadCategories(
    selectedCategory = ""
) {
    const category =
        document.getElementById(
            "category"
        );


    /*
     * Start with permanent categories
     */
    const categories = [...DEFAULT_CATEGORIES];


    try {
        const data =
            await KrestAPI(
                "/marketplace/categories"
            );


        const apiCategories =
            Array.isArray(data.categories) ?
            data.categories :
            [];


        /*
         * Add categories found in database
         * if they are not already present.
         */
        apiCategories.forEach(
            (item) => {
                const name =
                    String(
                        item.category || ""
                    ).trim();

                if (!name) {
                    return;
                }


                const exists =
                    categories.some(
                        (existing) =>
                        existing.toLowerCase() ===
                        name.toLowerCase()
                    );


                /*
                 * Electronic / Electronics alias
                 */
                const electronicAlias =
                    (
                        name.toLowerCase() ===
                        "electronics" &&
                        categories.some(
                            (existing) =>
                            existing.toLowerCase() ===
                            "electronic"
                        )
                    );


                if (!exists &&
                    !electronicAlias
                ) {
                    categories.push(name);
                }
            }
        );

    } catch (error) {
        console.error(
            "Unable to load marketplace categories:",
            error
        );
    }


    /* =========================================================
       SUPPORT CATEGORY PASSED FROM URL
    ========================================================= */

    if (selectedCategory) {
        const exists =
            categories.some(
                (item) =>
                item.toLowerCase() ===
                selectedCategory.toLowerCase()
            );


        if (!exists) {
            categories.push(
                selectedCategory
            );
        }
    }


    /* =========================================================
       BUILD SELECT OPTIONS
    ========================================================= */

    category.innerHTML = `
    <option value="">
      All categories
    </option>

    ${categories
      .map(
        (name) => `
          <option
            value="${KrestUI.escape(name)}"
          >
            ${KrestUI.escape(name)}
          </option>
        `
      )
      .join("")}
  `;


  category.value =
    selectedCategory;
}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const q =
      document.getElementById("q");

    const category =
      document.getElementById(
        "category"
      );

    const minPrice =
      document.getElementById(
        "minPrice"
      );

    const maxPrice =
      document.getElementById(
        "maxPrice"
      );

    const sort =
      document.getElementById(
        "sort"
      );

    const applyFilters =
      document.getElementById(
        "applyFilters"
      );


    /* =======================================================
       READ FILTERS FROM URL
    ======================================================== */

    const searchParams =
      new URLSearchParams(
        location.search
      );


    const selectedCategory =
      searchParams.get(
        "category"
      ) || "";


    q.value =
      searchParams.get("q") || "";

    minPrice.value =
      searchParams.get(
        "minPrice"
      ) || "";

    maxPrice.value =
      searchParams.get(
        "maxPrice"
      ) || "";


    if (
      searchParams.get("sort")
    ) {
      sort.value =
        searchParams.get("sort");
    }


    /* =======================================================
       LOAD CATEGORY DROPDOWN
    ======================================================== */

    await loadCategories(
      selectedCategory
    );


    /* =======================================================
       APPLY FILTER BUTTON
    ======================================================== */

    applyFilters.addEventListener(
      "click",
      loadProducts
    );


    /* =======================================================
       CATEGORY CHANGE
    ======================================================== */

    category.addEventListener(
      "change",
      loadProducts
    );


    /* =======================================================
       SORT CHANGE
    ======================================================== */

    sort.addEventListener(
      "change",
      loadProducts
    );


    /* =======================================================
       SEARCH WITH ENTER
    ======================================================== */

    q.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter"
        ) {
          event.preventDefault();

          loadProducts();
        }
      }
    );


    /* =======================================================
       INITIAL PRODUCTS
    ======================================================== */

    await loadProducts();
  }
);