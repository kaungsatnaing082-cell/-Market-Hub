async function loadInventory() {
  const rows = document.getElementById("inventoryRows");
  try {
    const data = await KrestAPI("/seller/products");
    const products = Array.isArray(data.products) ? data.products : [];

    rows.innerHTML = products.length
      ? products
          .map((product) => {
            const variantCount = Number(product.variant_count || 0);
            const stock = Number(product.stock || 0);
            const stockClass = stock === 0 ? "stock-out" : stock < 5 ? "stock-low" : "";

            return `
              <tr>
                <td><strong>${KrestUI.escape(product.name)}</strong>${variantCount ? `<div class="muted">${variantCount} variant${variantCount === 1 ? "" : "s"}</div>` : ""}</td>
                <td>${KrestUI.escape(product.sku || "—")}</td>
                <td class="${stockClass}">${stock}</td>
                <td>
                  ${
                    variantCount
                      ? '<span class="muted">Managed by variants</span>'
                      : `<input class="input" id="stock-${Number(product.id)}" type="number" min="0" step="1" value="${stock}" style="max-width:120px">`
                  }
                </td>
                <td>
                  ${
                    variantCount
                      ? `<a class="btn btn-secondary" href="/pages/seller/edit-product.html?id=${Number(product.id)}#variantManagement">Manage variants</a>`
                      : `<button class="btn btn-primary" onclick="updateStock(${Number(product.id)})">Update</button>`
                  }
                </td>
              </tr>`;
          })
          .join("")
      : '<tr><td colspan="5" class="empty">No products yet.</td></tr>';
  } catch (error) {
    rows.innerHTML = `<tr><td colspan="5" class="empty">${KrestUI.escape(error.message || "Unable to load inventory.")}</td></tr>`;
  }
}

async function updateStock(id) {
  const msg = document.getElementById("message");
  const input = document.getElementById(`stock-${id}`);
  if (!input) return;

  const stock = Number(input.value);
  if (!Number.isInteger(stock) || stock < 0) {
    KrestUI.showMessage(msg, "Stock must be a non-negative whole number.");
    return;
  }

  try {
    await KrestAPI(`/seller/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    });
    KrestUI.showMessage(msg, "Stock updated.", "success");
    loadInventory();
  } catch (error) {
    KrestUI.showMessage(msg, error.message || "Unable to update stock.");
  }
}

document.addEventListener("DOMContentLoaded", loadInventory);
