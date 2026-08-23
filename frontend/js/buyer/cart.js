function cartVariantLabel(item) {
  const parts = [];
  if (item.color) parts.push(item.color);
  if (item.size) parts.push(`Size ${item.size}`);
  if (item.weight_value !== null && item.weight_value !== undefined) {
    parts.push(`${Number(item.weight_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.weight_unit || ""}`.trim());
  }
  if (item.volume_value !== null && item.volume_value !== undefined) {
    parts.push(`${Number(item.volume_value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${item.volume_unit || ""}`.trim());
  }
  return parts.join(" / ");
}

async function loadCart() {
  const cartItems = document.getElementById("cartItems");
  const message = document.getElementById("message");

  try {
    const data = await KrestAPI("/buyer/cart");
    const items = Array.isArray(data.items) ? data.items : [];

    document.getElementById("summaryItems").textContent = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0,
    );
    document.getElementById("summarySubtotal").textContent = KrestUI.money(data.total);
    document.getElementById("summaryTotal").textContent = KrestUI.money(data.total);

    const checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.style.pointerEvents = items.length ? "" : "none";
    checkoutBtn.style.opacity = items.length ? "1" : ".5";

    cartItems.innerHTML = items.length
      ? `<h2 style="margin-bottom:8px">Your items</h2>` +
        items
          .map((item) => {
            const option = cartVariantLabel(item);
            return `
              <div class="cart-item">
                <div class="cart-thumb">
                  ${item.image_url ? `<img src="${KrestUI.escape(item.image_url)}" alt="${KrestUI.escape(item.name)}">` : "📦"}
                </div>
                <div>
                  <strong>${KrestUI.escape(item.name)}</strong>
                  <div class="muted">${KrestUI.escape(item.center_name)}</div>
                  ${option ? `<div class="cart-variant-label">${KrestUI.escape(option)}</div>` : ""}
                  <div>${KrestUI.money(item.price)}</div>
                </div>
                <div>
                  <input class="input" type="number" min="1" max="${Number(item.stock)}" value="${Number(item.quantity)}" style="width:92px" onchange="updateQty(${Number(item.id)},this.value)">
                  <button class="btn btn-link" onclick="removeItem(${Number(item.id)})">Remove</button>
                </div>
              </div>`;
          })
          .join("")
      : '<div class="empty">Your cart is empty. <a href="/pages/buyer/products.html" style="color:var(--primary);font-weight:800">Explore products</a></div>';
  } catch (error) {
    cartItems.innerHTML = `<div class="notice error">${KrestUI.escape(error.message || "Unable to load cart.")}</div>`;
    if (message) KrestUI.showMessage(message, error.message || "Unable to load cart.");
  }
}

async function updateQty(id, quantity) {
  try {
    await KrestAPI(`/buyer/cart/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: Number(quantity) }),
    });
    loadCart();
  } catch (error) {
    KrestUI.showMessage(document.getElementById("message"), error.message);
  }
}

async function removeItem(id) {
  try {
    await KrestAPI(`/buyer/cart/items/${id}`, { method: "DELETE" });
    loadCart();
  } catch (error) {
    KrestUI.showMessage(document.getElementById("message"), error.message);
  }
}

document.addEventListener("DOMContentLoaded", loadCart);
