document.addEventListener("DOMContentLoaded", async() => {
    exploreSearch.onsubmit = (e) => {
        e.preventDefault();
        location.href = `/pages/buyer/search-results.html?q=${encodeURIComponent(q.value.trim())}`;
    };
    try {
        const d = await KrestAPI("/marketplace/products?sort=popular&limit=12");
        exploreProducts.innerHTML =
            d.products.map(BuyerUI.productCard).join("") ||
            '<div class="panel empty">No products available.</div>';
    } catch (e) {
        exploreProducts.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
});