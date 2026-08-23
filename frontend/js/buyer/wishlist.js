async function load() {
    try {
        const d = await KrestAPI("/buyer/wishlist");
        wishlistGrid.innerHTML = d.products.length ?
            d.products
            .map(
                (p) =>
                `<article class="card market-card"><a href="/pages/buyer/product-detail.html?id=${p.id}"><div class="market-image">${p.image_url ? `<img src="${p.image_url}" alt="${p.name}">` : "📦"}</div></a><div class="market-content"><strong>${p.name}</strong><div class="muted">${p.center_name}</div><div class="market-price">${KrestUI.money(p.price)}</div><button class="btn btn-secondary" style="width:100%;margin-top:10px" onclick="removeWish(${p.id})">Remove</button></div></article>`,
          )
          .join("")
      : '<div class="panel empty">Your wishlist is empty.</div>';
  } catch (e) {
    wishlistGrid.innerHTML = `<div class="notice error">${e.message}</div>`;
  }
}
async function removeWish(id) {
  try {
    await KrestAPI(`/buyer/wishlist/${id}`, { method: "DELETE" });
    load();
  } catch (e) {
    KrestUI.showMessage(message, e.message);
  }
}
document.addEventListener("DOMContentLoaded", load);