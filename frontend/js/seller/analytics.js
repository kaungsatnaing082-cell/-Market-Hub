document.addEventListener("DOMContentLoaded", async() => {
    const top = document.getElementById("topProducts");
    try {
        const d = await KrestAPI("/seller/analytics");
        document.getElementById("views").textContent = d.summary.views;
        document.getElementById("orders").textContent = d.summary.orders;
        document.getElementById("units").textContent = d.summary.unitsSold;
        document.getElementById("revenue").textContent = KrestUI.money(
            d.summary.revenue,
        );
        const max = Math.max(1, ...d.topProducts.map((p) => p.units_sold));
        top.innerHTML = d.topProducts.length ?
            d.topProducts
            .map(
                (p) =>
                `<div class="bar-row"><strong>${p.name}</strong><div class="bar-track"><div class="bar-fill" style="width:${Math.round((p.units_sold / max) * 100)}%"></div></div><span>${p.units_sold}</span></div>`,
            )
            .join("") :
            '<div class="empty">No sales data yet.</div>';
    } catch (e) {
        top.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
});