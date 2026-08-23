async function run() {
    const term = q.value.trim();
    searchHeading.textContent = term ? `Results for “${term}”` : "Search results";
    try {
        const d = await KrestAPI(
            `/marketplace/search?q=${encodeURIComponent(term)}`,
        );
        productResults.innerHTML =
            d.products.map(BuyerUI.productCard).join("") ||
            '<div class="panel empty">No product matches.</div>';
        centerResults.innerHTML =
            d.centers.map(BuyerUI.centerCard).join("") ||
            '<div class="panel empty">No center matches.</div>';
    } catch (e) {
        productResults.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    q.value = new URLSearchParams(location.search).get("q") || "";
    searchForm.onsubmit = (e) => {
        e.preventDefault();
        history.replaceState(null, "", `?q=${encodeURIComponent(q.value.trim())}`);
        run();
    };
    run();
});