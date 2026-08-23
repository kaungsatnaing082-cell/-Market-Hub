async function publicSearchRun() {
    const term = publicSearchQ.value.trim();
    publicSearchHeading.textContent = term ?
        `Results for “${term}”` :
        "Search results";
    try {
        const d = await KrestAPI(
            `/marketplace/search?q=${encodeURIComponent(term)}`,
        );
        publicProductResults.innerHTML =
            d.products.map(publicProductCard).join("") ||
            '<div class="panel empty">No product matches.</div>';
        publicCenterResults.innerHTML =
            d.centers.map(publicCenterCard).join("") ||
            '<div class="panel empty">No center matches.</div>';
    } catch (e) {
        publicProductResults.innerHTML = `<div class="notice error">${KrestUI.escape(e.message)}</div>`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    publicSearchQ.value = new URLSearchParams(location.search).get("q") || "";
    publicSearchForm.onsubmit = (e) => {
        e.preventDefault();
        history.replaceState(
            null,
            "",
            `?q=${encodeURIComponent(publicSearchQ.value.trim())}`,
        );
        publicSearchRun();
    };
    publicSearchRun();
});