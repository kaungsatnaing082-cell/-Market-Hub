const oid = new URLSearchParams(location.search).get("id");

function sellerOrderVariantLabel(item) {
  const parts = [];
  if (item.selected_color) parts.push(item.selected_color);
  if (item.selected_size) parts.push(`Size ${item.selected_size}`);
  if (item.selected_weight_value !== null && item.selected_weight_value !== undefined) parts.push(`${Number(item.selected_weight_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.selected_weight_unit || ""}`.trim());
  if (item.selected_volume_value !== null && item.selected_volume_value !== undefined) parts.push(`${Number(item.selected_volume_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.selected_volume_unit || ""}`.trim());
  return parts.join(" / ");
}

async function loadOrder() {
  try {
    const data = await KrestAPI(`/seller/orders/${oid}`);
    const order = data.order;
    document.getElementById("statusSelect").value = order.status;
    document.getElementById("orderInfo").innerHTML = `
      <div class="panel-title"><h2>Order #${Number(order.id)}</h2>${KrestUI.badge(order.status)}</div>
      <div class="definition"><dt>Buyer</dt><dd>${KrestUI.escape(order.buyer_name)}</dd></div>
      <div class="definition"><dt>Email</dt><dd>${KrestUI.escape(order.buyer_email)}</dd></div>
      <div class="definition"><dt>Total</dt><dd>${KrestUI.money(order.total_amount)}</dd></div>
      <div class="definition"><dt>Date</dt><dd>${KrestUI.date(order.created_at)}</dd></div>
      <div style="margin-top:16px"><strong>Items</strong>
        ${data.items
          .map((item) => {
            const option = sellerOrderVariantLabel(item);
            return `<div class="card card-body" style="margin-top:10px"><div><strong>${KrestUI.escape(item.product_name)}</strong>${option ? `<div class="muted">${KrestUI.escape(option)}</div>` : ""}</div><span>× ${Number(item.quantity)}</span><strong style="float:right">${KrestUI.money(Number(item.unit_price) * Number(item.quantity))}</strong></div>`;
          })
          .join("")}
      </div>`;
  } catch (error) {
    KrestUI.showMessage(document.getElementById("message"), error.message || "Unable to load order.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadOrder();
  document.getElementById("saveStatus").onclick = async () => {
    try {
      await KrestAPI(`/seller/orders/${oid}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: document.getElementById("statusSelect").value }),
      });
      KrestUI.showMessage(document.getElementById("message"), "Order status updated.", "success");
      loadOrder();
    } catch (error) {
      KrestUI.showMessage(document.getElementById("message"), error.message || "Unable to update order status.");
    }
  };
});
