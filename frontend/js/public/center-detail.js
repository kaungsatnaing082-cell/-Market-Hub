document.addEventListener("DOMContentLoaded", async() => {
            const id = new URLSearchParams(location.search).get("id");
            if (!id) {
                publicCenterDetail.innerHTML =
                    '<div class="notice error">Choose a center first.</div>';
                return;
            }
            try {
                const d = await KrestAPI(`/marketplace/centers/${id}`),
                    c = d.center,
                    e = KrestUI.escape;
                publicCenterDetail.innerHTML = `<div class="card" style="overflow:hidden"><div style="height:220px;background:linear-gradient(135deg,#1d4ed8,#0f766e)">${c.cover_image ? `<img src="${e(c.cover_image)}" alt="${e(c.name)}" style="width:100%;height:100%;object-fit:cover">` : ""}</div><div class="card-body"><div class="center-card" style="padding:0"><div class="center-avatar">${
      c.profile_image
        ? `<img src="${e(c.profile_image)}" alt="${e(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
        : e(
            c.name
              .split(/\s+/)
              .map((x) => x[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          )
    }</div><div><h1>${e(c.name)}</h1><div class="rating">★ ${Number(c.rating || 0).toFixed(1)} · ${Number(c.review_count || 0)} reviews</div><div class="muted">${e(c.category)} · ${e(c.location || "Location not set")}</div></div></div><p class="muted" style="margin-top:18px">${e(c.description || "No description provided.")}</p></div></div><h2 style="margin-top:26px">Products</h2><div class="grid grid-4" style="margin-top:16px">${d.products.map(publicProductCard).join("") || '<div class="panel empty">No active products.</div>'}</div><h2 style="margin-top:30px">Center reviews</h2><div class="grid grid-3" style="margin-top:16px">${d.reviews.length ? d.reviews.map((r) => `<article class="card card-body"><div class="rating">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div><strong>${e(r.buyer_name)}</strong><p class="muted">${e(r.comment || "No comment.")}</p></article>`).join("") : '<div class="panel empty">No reviews yet.</div>'}</div>`;
  } catch (e) {
    publicCenterDetail.innerHTML = `<div class="notice error">${KrestUI.escape(e.message)}</div>`;
  }
});