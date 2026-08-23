function marketplacePriceText(product) {
  const hasVariants = Number(product.has_variants || product.variant_count || 0) > 0;
  const min = Number(product.min_variant_price);
  const max = Number(product.max_variant_price);

  if (hasVariants && Number.isFinite(min)) {
    if (Number.isFinite(max) && max !== min) return `${KrestUI.money(min)} – ${KrestUI.money(max)}`;
    return KrestUI.money(min);
  }
  return KrestUI.money(product.price);
}

window.BuyerUI = {
  productCard(product) {
    const e = KrestUI.escape;
    return `<article class="card market-card"><a href="/pages/buyer/product-detail.html?id=${Number(product.id)}"><div class="market-image">${product.image_url ? `<img src="${e(product.image_url)}" alt="${e(product.name)}">` : "📦"}</div></a><div class="market-content"><a href="/pages/buyer/product-detail.html?id=${Number(product.id)}"><h3>${e(product.name)}</h3></a><div class="market-meta"><span>${e(product.center_name || "Market Hub")}</span><span>★ ${Number(product.rating || 0).toFixed(1)}</span></div><div class="market-price">${e(marketplacePriceText(product))}</div></div></article>`;
  },

  centerCard(center) {
    const e = KrestUI.escape;
    return `<article class="card center-shop-card"><div class="center-shop-logo">${
      center.profile_image
        ? `<img src="${e(center.profile_image)}" alt="${e(center.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
        : e(
            (center.name || "MH")
              .split(/\s+/)
              .map((x) => x[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          )
    }</div><div><strong>${e(center.name)}</strong><div class="muted">${e(center.category)} · ${e(center.location || "Location not set")}</div><div class="rating">★ ${Number(center.rating || 0).toFixed(1)}</div></div><a class="btn btn-secondary" href="/pages/buyer/center-detail.html?id=${Number(center.id)}">View center</a></article>`;
  },
};

async function refreshBuyerCartCount() {
  try {
    const data = await KrestAPI("/buyer/cart");
    const count = data.items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const el = document.getElementById("sidebarCartCount");
    if (el) el.textContent = count;
  } catch {}
}

document.addEventListener("DOMContentLoaded", refreshBuyerCartCount);
document.addEventListener("krest:cart-updated", refreshBuyerCartCount);
