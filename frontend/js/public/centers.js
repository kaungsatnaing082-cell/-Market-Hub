async function loadPublicCenters() {
    try {
        const d = await KrestAPI(
            `/marketplace/centers?q=${encodeURIComponent(publicCenterSearch.value.trim())}`,
        );
        publicCenterGrid.innerHTML =
            d.centers.map(publicCenterCard).join("") ||
            '<div class="panel empty">No centers found.</div>';
    } catch (e) {
        publicCenterGrid.innerHTML = `<div class="notice error">${KrestUI.escape(e.message)}</div>`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    publicCenterBtn.onclick = loadPublicCenters;
    publicCenterSearch.onkeydown = (e) => {
        if (e.key === "Enter") loadPublicCenters();
    };
    loadPublicCenters();
});