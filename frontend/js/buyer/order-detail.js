function orderVariantLabel(item) {
  const parts = [];
  if (item.selected_color) parts.push(item.selected_color);
  if (item.selected_size) parts.push(`Size ${item.selected_size}`);
  if (item.selected_weight_value !== null && item.selected_weight_value !== undefined) parts.push(`${Number(item.selected_weight_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.selected_weight_unit || ""}`.trim());
  if (item.selected_volume_value !== null && item.selected_volume_value !== undefined) parts.push(`${Number(item.selected_volume_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.selected_volume_unit || ""}`.trim());
  return parts.join(" / ");
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");
  const orderDetail = document.getElementById("orderDetail");

  try {
    const data = await KrestAPI(`/buyer/orders/${id}`);
    const order = data.order;

    orderDetail.innerHTML = `
      <div class="detail-grid">
        <section class="panel">
          <div class="panel-title"><h2>Order #${Number(order.id)}</h2>${KrestUI.badge(order.status)}</div>
          <div class="definition"><dt>Center</dt><dd>${KrestUI.escape(order.center_name)}</dd></div>
          <div class="definition"><dt>Order date</dt><dd>${KrestUI.date(order.created_at)}</dd></div>
          <div class="definition"><dt>Payment</dt><dd>${KrestUI.escape(order.payment_status)} · ${KrestUI.escape(order.payment_method || "COD")}</dd></div>
          <div class="definition"><dt>Delivery</dt><dd>${KrestUI.escape(order.delivery_address || "—")}</dd></div>
          <div class="definition"><dt>Total</dt><dd><strong>${KrestUI.money(order.total_amount)}</strong></dd></div>
        </section>
        <section class="panel">
          <h2>Items</h2>
          ${data.items
            .map((item) => {
              const option = orderVariantLabel(item);
              return `<div class="card card-body" style="margin-top:10px"><strong>${KrestUI.escape(item.product_name)}</strong>${option ? `<div class="order-variant-label">${KrestUI.escape(option)}</div>` : ""}<div class="muted">Qty ${Number(item.quantity)} · ${KrestUI.money(item.unit_price)}</div>${order.status === "DELIVERED" ? `<a class="btn btn-link" href="/pages/buyer/write-review.html?type=PRODUCT&id=${Number(item.product_id)}">Write product review</a>` : ""}</div>`;
            })
            .join("")}
          ${order.status === "DELIVERED" ? `<a class="btn btn-secondary" style="margin-top:14px" href="/pages/buyer/write-review.html?type=CENTER&id=${Number(order.center_id)}">Review center</a>` : ""}
        </section>
      </div>`;
  } catch (error) {
    orderDetail.innerHTML = `<div class="notice error">${KrestUI.escape(error.message || "Unable to load order.")}</div>`;
  }
});
