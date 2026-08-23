/* =========================================================
   MARKET HUB - BUYER CENTERS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
            const centerSearch =
                document.getElementById("centerSearch");

            const centerSearchBtn =
                document.getElementById("centerSearchBtn");

            const centerGrid =
                document.getElementById("centerGrid");

            const centerCount =
                document.getElementById("centerCount");


            /* =========================================================
               ESCAPE
            ========================================================= */

            function escapeHtml(value) {
                return KrestUI.escape(value || "");
            }


            /* =========================================================
               GET INITIALS
            ========================================================= */

            function getInitials(name) {
                return String(name || "Center")
                    .trim()
                    .split(/\s+/)
                    .map(word => word.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
            }


            /* =========================================================
               FORMAT RATING
            ========================================================= */

            function getRating(center) {
                const value =
                    center.average_rating ||
                    center.avg_rating ||
                    center.rating ||
                    center.review_rating ||
                    0;

                const rating = Number(value);

                if (!Number.isFinite(rating)) {
                    return "0.0";
                }

                return rating.toFixed(1);
            }


            /* =========================================================
               PRODUCT COUNT
            ========================================================= */

            function getProductCount(center) {
                const value =
                    center.product_count ||
                    center.products_count ||
                    center.total_products ||
                    0;

                const count = Number(value);

                return Number.isFinite(count) ?
                    count :
                    0;
            }


            /* =========================================================
               CENTER CARD
            ========================================================= */

            function centerCard(center) {
                const id =
                    center.id ||
                    center.center_id ||
                    "";

                const name =
                    center.name ||
                    center.center_name ||
                    "Marketplace Center";

                const category =
                    center.category ||
                    "General";

                const location =
                    center.location ||
                    "Location not provided";

                const profileImage =
                    center.profile_image ||
                    center.profileImage ||
                    "";

                const coverImage =
                    center.cover_image ||
                    center.coverImage ||
                    "";

                const rating =
                    getRating(center);

                const productCount =
                    getProductCount(center);

                const initials =
                    getInitials(name);


                return `
      <article class="market-center-card">

        <!-- ===============================================
             COVER
        ================================================ -->

        <div class="market-center-cover">

          ${
            coverImage
              ? `
                <img
                  src="${escapeHtml(coverImage)}"
                  alt="${escapeHtml(name)} cover"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >
              `
              : `
                <div class="market-center-cover-placeholder">
                  <span>🏪</span>
                </div>
              `
          }

          <div class="center-approved-badge">
            <span>✓</span>
            Approved
          </div>

        </div>


        <!-- ===============================================
             CONTENT
        ================================================ -->

        <div class="market-center-content">

          <!-- LOGO -->

          <div class="market-center-logo">

            ${
              profileImage
                ? `
                  <img
                    src="${escapeHtml(profileImage)}"
                    alt="${escapeHtml(name)}"
                    loading="lazy"
                    onerror="
                      this.style.display='none';
                      this.nextElementSibling.style.display='grid';
                    "
                  >

                  <span
                    class="market-center-initials"
                    style="display:none"
                  >
                    ${escapeHtml(initials)}
                  </span>
                `
                : `
                  <span class="market-center-initials">
                    ${escapeHtml(initials)}
                  </span>
                `
            }

          </div>


          <!-- TOP -->

          <div class="market-center-top">

            <div class="market-center-title-wrap">

              <h3>
                ${escapeHtml(name)}
              </h3>

              <span class="market-center-category">
                ${escapeHtml(category)}
              </span>

            </div>

          </div>


          <!-- LOCATION -->

          <div class="market-center-location">

            <span>
              📍
            </span>

            <span>
              ${escapeHtml(location)}
            </span>

          </div>


          <!-- STATS -->

          <div class="market-center-stats">

            <div class="center-stat">

              <span class="center-stat-icon">
                ★
              </span>

              <div>
                <strong>
                  ${rating}
                </strong>

                <small>
                  Rating
                </small>
              </div>

            </div>


            <div class="center-stat-divider"></div>


            <div class="center-stat">

              <span class="center-stat-icon">
                ▣
              </span>

              <div>
                <strong>
                  ${productCount}
                </strong>

                <small>
                  ${
                    productCount === 1
                      ? "Product"
                      : "Products"
                  }
                </small>
              </div>

            </div>

          </div>


          <!-- ACTION -->

          <a
            class="btn btn-primary market-center-button"
            href="/pages/buyer/center-detail.html?id=${encodeURIComponent(id)}"
          >
            <span>
              View Center
            </span>

            <span>
              →
            </span>
          </a>

        </div>

      </article>
    `;
  }


  /* =========================================================
     LOADING UI
  ========================================================= */

  function showLoading() {
    centerGrid.innerHTML = `
      <div class="center-loading-card">

        <div class="center-loading-cover"></div>

        <div class="center-loading-body">

          <div class="center-loading-logo"></div>

          <div class="center-loading-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </div>


      <div class="center-loading-card">

        <div class="center-loading-cover"></div>

        <div class="center-loading-body">

          <div class="center-loading-logo"></div>

          <div class="center-loading-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </div>
    `;

    if (centerCount) {
      centerCount.textContent =
        "Loading...";
    }
  }


  /* =========================================================
     EMPTY STATE
  ========================================================= */

  function showEmpty(searchTerm) {
    centerGrid.innerHTML = `
      <div class="center-empty-state">

        <div class="center-empty-icon">
          🏪
        </div>

        <h3>
          No centers found
        </h3>

        <p>
          ${
            searchTerm
              ? `No center matches "${escapeHtml(searchTerm)}".`
              : "There are no approved marketplace centers yet."
          }
        </p>

        ${
          searchTerm
            ? `
              <button
                class="btn btn-secondary"
                id="clearCenterSearch"
                type="button"
              >
                Clear search
              </button>
            `
            : ""
        }

      </div>
    `;


    const clearButton =
      document.getElementById(
        "clearCenterSearch"
      );

    if (clearButton) {
      clearButton.addEventListener(
        "click",
        () => {
          centerSearch.value = "";
          loadCenters();
        }
      );
    }
  }


  /* =========================================================
     LOAD CENTERS
  ========================================================= */

  async function loadCenters() {
    const searchTerm =
      centerSearch.value.trim();

    showLoading();


    try {
      const data =
        await KrestAPI(
          `/marketplace/centers?q=${encodeURIComponent(
            searchTerm
          )}`
        );


      const centers =
        Array.isArray(data.centers)
          ? data.centers
          : [];


      /* =====================================================
         COUNT
      ====================================================== */

      if (centerCount) {
        centerCount.textContent =
          `${centers.length} ${
            centers.length === 1
              ? "center"
              : "centers"
          }`;
      }


      /* =====================================================
         EMPTY
      ====================================================== */

      if (!centers.length) {
        showEmpty(searchTerm);
        return;
      }


      /* =====================================================
         RENDER
      ====================================================== */

      centerGrid.innerHTML =
        centers
          .map(centerCard)
          .join("");


      /* =====================================================
         UPDATE URL
      ====================================================== */

      const params =
        new URLSearchParams();

      if (searchTerm) {
        params.set(
          "q",
          searchTerm
        );
      }


      const newUrl =
        params.toString()
          ? `${location.pathname}?${params.toString()}`
          : location.pathname;


      history.replaceState(
        null,
        "",
        newUrl
      );

    } catch (error) {
      if (centerCount) {
        centerCount.textContent =
          "0 centers";
      }


      centerGrid.innerHTML = `
        <div class="notice error">
          ${escapeHtml(
            error.message ||
            "Unable to load marketplace centers."
          )}
        </div>
      `;
    }
  }


  /* =========================================================
     SEARCH BUTTON
  ========================================================= */

  centerSearchBtn.addEventListener(
    "click",
    loadCenters
  );


  /* =========================================================
     ENTER SEARCH
  ========================================================= */

  centerSearch.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        event.preventDefault();

        loadCenters();
      }
    }
  );


  /* =========================================================
     INITIAL URL SEARCH
  ========================================================= */

  const searchParams =
    new URLSearchParams(
      location.search
    );

  centerSearch.value =
    searchParams.get("q") || "";


  /* =========================================================
     START
  ========================================================= */

  loadCenters();
});