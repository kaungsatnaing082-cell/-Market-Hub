let orderData = [];

function renderOrders() {
    const q = document.getElementById("orderSearch").value.toLowerCase(),
        s = document.getElementById("orderStatus").value,
        list = orderData.filter(
            (o) =>
            (!q || `${o.id} ${o.buyer_name}`.toLowerCase().includes(q)) &&
            (!s || o.status === s),
        );
    document.getElementById("orderRows").innerHTML = list.length ?
        list
        .map(
            (o) =>
            `<tr><td><strong>#${o.id}</strong></td><td>${o.buyer_name}</td><td>${o.item_count}</td><td>${KrestUI.money(o.total_amount)}</td><td>${KrestUI.badge(o.status)}</td><td>${KrestUI.date(o.created_at)}</td><td><a class="btn btn-secondary" href="/pages/seller/order-detail.html?id=${o.id}">Open</a></td></tr>`,
        )
        .join("") :
        '<tr><td colspan="7" class="empty">No matching orders.</td></tr>';
}
document.addEventListener("DOMContentLoaded", async() => {
    try {
        orderData = (await KrestAPI("/seller/orders")).orders;
        renderOrders();
    } catch (e) {
        document.getElementById("orderRows").innerHTML =
            `<tr><td colspan="7">${e.message}</td></tr>`;
    }
    document.getElementById("orderSearch").oninput = renderOrders;
    document.getElementById("orderStatus").onchange = renderOrders;
});