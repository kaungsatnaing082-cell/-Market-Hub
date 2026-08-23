let cartTotal = 0;

function checkoutVariantLabel(item) {
  const parts = [];
  if (item.color) parts.push(item.color);
  if (item.size) parts.push(`Size ${item.size}`);
  if (item.weight_value !== null && item.weight_value !== undefined) parts.push(`${Number(item.weight_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.weight_unit || ""}`.trim());
  if (item.volume_value !== null && item.volume_value !== undefined) parts.push(`${Number(item.volume_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.volume_unit || ""}`.trim());
  return parts.join(" / ");
}

document.addEventListener("DOMContentLoaded", async () => {
  const message = document.getElementById("message");
  const checkoutForm = document.getElementById("checkoutForm");

  try {
    const [cart, profile] = await Promise.all([
      KrestAPI("/buyer/cart"),
      KrestAPI("/buyer/me"),
    ]);

    if (!cart.items.length) {
      location.href = "/pages/buyer/cart.html";
      return;
    }

    cartTotal = cart.total;
    document.getElementById("checkoutItems").innerHTML = cart.items
      .map((item) => {
        const option = checkoutVariantLabel(item);
        return `<div class="summary-row"><span>${KrestUI.escape(item.name)}${option ? `<small class="checkout-option">${KrestUI.escape(option)}</small>` : ""} × ${Number(item.quantity)}</span><strong>${KrestUI.money(Number(item.price) * Number(item.quantity))}</strong></div>`;
      })
      .join("");

    document.getElementById("checkoutTotal").textContent = KrestUI.money(cart.total);
    document.getElementById("address").value = profile.profile.default_address || "";
    document.getElementById("phone").value = profile.user.phone || "";
  } catch (error) {
    KrestUI.showMessage(message, error.message || "Unable to load checkout.");
  }

  checkoutForm.onsubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await KrestAPI("/buyer/checkout", {
        method: "POST",
        body: JSON.stringify({
          address: document.getElementById("address").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          paymentMethod: document.getElementById("paymentMethod").value,
        }),
      });
      location.href = `/pages/buyer/order-success.html?orders=${result.orderIds.join(",")}`;
    } catch (error) {
      KrestUI.showMessage(message, error.message || "Unable to place order.");
    }
  };
});
