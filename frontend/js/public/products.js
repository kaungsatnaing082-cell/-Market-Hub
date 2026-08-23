async function loadPublicProducts() {
    const params = new URLSearchParams();
    if (publicQ.value.trim()) params.set("q", publicQ.value.trim());
    if (publicCategory.value) params.set("category", publicCategory.value);
    params.set("sort", publicSort.value);
    try {
        const d = await KrestAPI(`/marketplace/products?${params}`);
        publicProductGrid.innerHTML =
            d.products.map(publicProductCard).join("") ||
            '<div class="panel empty">No products match your search.</div>';
        publicResultCount.textContent = `${d.products.length} result${d.products.length === 1 ? "" : "s"}`;
    } catch (e) {
        publicProductGrid.innerHTML = `<div class="notice error">${KrestUI.escape(e.message)}</div>`;
    }
}
document.addEventListener("DOMContentLoaded", async() => {
    const sp = new URLSearchParams(location.search);
    publicQ.value = sp.get("q") || "";
    try {
        const d = await KrestAPI("/marketplace/categories");
        publicCategory.innerHTML =
            '<option value="">All categories</option>' +
            d.categories
            .map((c) => `<option>${KrestUI.escape(c.category)}</option>`)
            .join("");
        publicCategory.value = sp.get("category") || "";
    } catch {}
    publicApply.onclick = loadPublicProducts;
    loadPublicProducts();
});