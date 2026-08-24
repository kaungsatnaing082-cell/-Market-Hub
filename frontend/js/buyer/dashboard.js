document.addEventListener("DOMContentLoaded", async () => {

    const searchForm = document.getElementById("dashboardSearch");
    const searchInput = document.getElementById("dashQ");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            location.href =
                `/pages/buyer/search-results.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        });
    }

    const recommendedProducts =
        document.getElementById("recommendedProducts");

    const popularCenters =
        document.getElementById("popularCenters");

    const ordersCount =
        document.getElementById("ordersCount");

    const wishlistCount =
        document.getElementById("wishlistCount");

    const cartCount =
        document.getElementById("cartCount");

    const reportsCount =
        document.getElementById("reportsCount");

    try {

        const d = await KrestAPI("/buyer/dashboard");

        if (ordersCount)
            ordersCount.textContent = d.stats?.orders ?? 0;

        if (wishlistCount)
            wishlistCount.textContent = d.stats?.wishlist ?? 0;

        if (cartCount)
            cartCount.textContent = d.stats?.cartItems ?? 0;

        if (reportsCount)
            reportsCount.textContent = d.stats?.reports ?? 0;


        if (recommendedProducts) {
            recommendedProducts.innerHTML =
                d.products?.length
                    ? d.products.map(BuyerUI.productCard).join("")
                    : `<div class="panel empty">No products yet.</div>`;
        }


        if (popularCenters) {
            popularCenters.innerHTML =
                d.centers?.length
                    ? d.centers.map(BuyerUI.centerCard).join("")
                    : `<div class="panel empty">No centers yet.</div>`;
        }


    } catch (e) {

        console.error("Dashboard error:", e);

        if (recommendedProducts) {
            recommendedProducts.innerHTML =
                `<div class="notice error">${KrestUI.escape(e.message)}</div>`;
        }

    }

});
