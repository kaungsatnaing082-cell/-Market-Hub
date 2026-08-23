function publicProductCard(p) {
    const e = KrestUI.escape;
    return `<article class="card product-card"><a href="/pages/public/product-detail.html?id=${Number(p.id)}"><div class="product-visual">${p.image_url ? `<img src="${e(p.image_url)}" alt="${e(p.name)}" style="width:100%;height:100%;object-fit:cover">` : "📦"}</div></a><div class="card-body"><div class="product-meta"><div><a href="/pages/public/product-detail.html?id=${Number(p.id)}"><strong>${e(p.name)}</strong></a><div class="muted">${e(p.center_name)}</div><div class="rating">★ ${Number(p.rating || 0).toFixed(1)}</div></div><span class="price">${KrestUI.money(p.price)}</span></div></div></article>`;
}
function publicCenterCard(c) {
  const e = KrestUI.escape,
    initials = e(
      (c.name || "KC")
        .split(/\s+/)
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    );
  return `<a class="card center-card" href="/pages/public/center-detail.html?id=${Number(c.id)}"><div class="center-avatar">${c.profile_image ? `<img src="${e(c.profile_image)}" alt="${e(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : initials}</div><div><strong>${e(c.name)}</strong><div class="muted">${e(c.category)} · ${e(c.location || "Location not set")}</div><div class="rating">★ ${Number(c.rating || 0).toFixed(1)}</div></div></a>`;
}
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [stats, products, centers] = await Promise.all([
      KrestAPI("/marketplace/stats"),
      KrestAPI("/marketplace/products?sort=popular&limit=4"),
      KrestAPI("/marketplace/centers?limit=3"),
    ]);
    const map = {
      homeCenterCount: stats.stats.centers,
      homeBuyerCount: stats.stats.buyers,
      homeProductCount: stats.stats.products,
      homeOrderCount: stats.stats.orders,
    };
    Object.entries(map).forEach(([id, v]) => {
      const el = document.getElementById(id);
      if (el)
        el.textContent =
          Number(v).toLocaleString() +
          (id === "homeCenterCount" || id === "homeBuyerCount" ? "+" : "");
    });
    const pg = document.getElementById("homePopularProducts");
    if (pg)
      pg.innerHTML =
        products.products.map(publicProductCard).join("") ||
        '<div class="panel empty">Products will appear here when sellers publish them.</div>';
    const cg = document.getElementById("homePopularCenters");
    if (cg)
      cg.innerHTML =
        centers.centers.map(publicCenterCard).join("") ||
        '<div class="panel empty">Approved centers will appear here.</div>';
    const hp = products.products[0],
      hc = centers.centers[0];
    if (hp) {
      document.getElementById("heroTrendingProduct").innerHTML =
        `<strong>Trending product</strong><div class="muted">${KrestUI.escape(hp.name)} · ${KrestUI.money(hp.price)}</div>`;
    }
    if (hc) {
      document.getElementById("heroPopularCenter").innerHTML =
        `<strong>Popular center</strong><div class="muted">${KrestUI.escape(hc.name)} · ★ ${Number(hc.rating || 0).toFixed(1)}</div>`;
    }
  } catch (err) {
    document
      .getElementById("homePopularProducts")
      ?.insertAdjacentHTML(
        "beforeend",
        `<div class="notice error">${KrestUI.escape(err.message)}</div>`,
      );
  }
});