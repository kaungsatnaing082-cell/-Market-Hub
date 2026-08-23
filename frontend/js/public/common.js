function publicPriceText(product) {
  const hasVariants = Number(product.has_variants || product.variant_count || 0) > 0;
  const min = Number(product.min_variant_price);
  const max = Number(product.max_variant_price);
  if (hasVariants && Number.isFinite(min)) {
    if (Number.isFinite(max) && max !== min) return `${KrestUI.money(min)} – ${KrestUI.money(max)}`;
    return KrestUI.money(min);
  }
  return KrestUI.money(product.price);
}

window.publicProductCard = function (product) {
  const e = KrestUI.escape;
  return `<article class="card product-card"><a href="/pages/public/product-detail.html?id=${Number(product.id)}"><div class="product-visual">${product.image_url ? `<img src="${e(product.image_url)}" alt="${e(product.name)}" style="width:100%;height:100%;object-fit:cover">` : "📦"}</div></a><div class="card-body"><div class="product-meta"><div><a href="/pages/public/product-detail.html?id=${Number(product.id)}"><strong>${e(product.name)}</strong></a><div class="muted">${e(product.center_name || "Market Hub")}</div><div class="rating">★ ${Number(product.rating || 0).toFixed(1)}</div></div><span class="price">${e(publicPriceText(product))}</span></div></div></article>`;
};

window.publicCenterCard = function (center) {
  const e = KrestUI.escape;
  const initials = e(
    (center.name || "MH")
      .split(/\s+/)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  );
  return `<a class="card center-card" href="/pages/public/center-detail.html?id=${Number(center.id)}"><div class="center-avatar">${center.profile_image ? `<img src="${e(center.profile_image)}" alt="${e(center.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : initials}</div><div><strong>${e(center.name)}</strong><div class="muted">${e(center.category)} · ${e(center.location || "Location not set")}</div><div class="rating">★ ${Number(center.rating || 0).toFixed(1)}</div></div></a>`;
};
