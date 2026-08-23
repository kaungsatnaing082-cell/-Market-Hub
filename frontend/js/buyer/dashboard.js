document.addEventListener("DOMContentLoaded", async() => {
    dashboardSearch.onsubmit = (e) => {
        e.preventDefault();
        location.href = `/pages/buyer/search-results.html?q=${encodeURIComponent(dashQ.value.trim())}`;
    };
    try {
        const d = await KrestAPI("/buyer/dashboard");
        ordersCount.textContent = d.stats.orders;
        wishlistCount.textContent = d.stats.wishlist;
        cartCount.textContent = d.stats.cartItems;
        reportsCount.textContent = d.stats.reports;
        recommendedProducts.innerHTML = d.products.length ?
            d.products.map(BuyerUI.productCard).join("") :
            '<div class="panel empty">No products yet.</div>';
        popularCenters.innerHTML = d.centers.length ?
            d.centers.map(BuyerUI.centerCard).join("") :
            '<div class="panel empty">No centers yet.</div>';
    } catch (e) {
        recommendedProducts.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
});