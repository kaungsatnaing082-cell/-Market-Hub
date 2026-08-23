let orders = [];

function render() {
    const s = statusFilter.value,
        list = orders.filter((o) => !s || o.status === s);
    orderList.innerHTML = list.length ?
        list
        .map(
            (o) =>
            `<article class="card order-card"><div class="order-head"><div><strong>Order #${o.id}</strong><div class="muted">${o.center_name} · ${KrestUI.date(o.created_at)}</div></div>${KrestUI.badge(o.status)}</div><div class="summary-row" style="margin-top:8px"><span>${o.item_count} item${o.item_count == 1 ? "" : "s"}</span><strong>${KrestUI.money(o.total_amount)}</strong></div><a class="btn btn-secondary" href="/pages/buyer/order-detail.html?id=${o.id}">View order</a></article>`,
        )
        .join("") :
        '<div class="panel empty">No orders found.</div>';
}
document.addEventListener("DOMContentLoaded", async() => {
    try {
        orders = (await KrestAPI("/buyer/orders")).orders;
        render();
    } catch (e) {
        orderList.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
    statusFilter.onchange = render;
});