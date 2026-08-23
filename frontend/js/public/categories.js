const publicCategoryIcons = {
    Electronics: "💻",
    Fashion: "👕",
    "Home & Living": "🏠",
    Beauty: "💄",
    Books: "📚",
    Sports: "🏃",
    Other: "🛍️",
};
document.addEventListener("DOMContentLoaded", async() => {
    try {
        const d = await KrestAPI("/marketplace/categories");
        publicCategoryGrid.innerHTML =
            d.categories
            .map(
                (c) =>
                `<a class="card category-card" href="/pages/public/products.html?category=${encodeURIComponent(c.category)}"><div class="category-icon">${publicCategoryIcons[c.category] || "🛍️"}</div><strong>${KrestUI.escape(c.category)}</strong><div class="muted">${Number(c.product_count)} products</div></a>`,
            )
            .join("") || '<div class="panel empty">No categories yet.</div>';
    } catch (e) {
        publicCategoryGrid.innerHTML = `<div class="notice error">${KrestUI.escape(e.message)}</div>`;
    }
});