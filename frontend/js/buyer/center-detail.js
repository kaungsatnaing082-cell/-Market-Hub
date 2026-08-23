const centerId = new URLSearchParams(location.search).get("id");
document.addEventListener("DOMContentLoaded", async() => {
            try {
                const d = await KrestAPI(`/marketplace/centers/${centerId}`),
                    c = d.center;
                centerDetail.innerHTML = `<div class="center-cover">${c.cover_image ? `<img src="${c.cover_image}" alt="${c.name}">` : ""}</div><div class="card card-body" style="margin-top:-36px;position:relative;width:calc(100% - 34px);margin-left:auto;margin-right:auto"><div class="center-shop-card" style="padding:0"><div class="center-shop-logo">${
      c.profile_image
        ? `<img src="${KrestUI.escape(c.profile_image)}" alt="${KrestUI.escape(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
        : c.name
            .split(/\s+/)
            .map((x) => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
    }</div><div><h2>${c.name}</h2><div class="muted">${c.category} · ${c.location || "Location not set"}</div><div class="rating">★ ${Number(c.rating || 0).toFixed(1)} · ${c.review_count} reviews</div></div><a class="btn btn-link" href="/pages/buyer/create-report.html?type=CENTER&id=${c.id}">Report center</a></div><p class="muted" style="margin-top:16px">${c.description || "No description."}</p></div>`;
    centerProducts.innerHTML =
      d.products.map(BuyerUI.productCard).join("") ||
      '<div class="panel empty">No active products.</div>';
    centerReviews.innerHTML = d.reviews.length
      ? d.reviews
          .map(
            (r) =>
              `<article class="card card-body"><div class="rating">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div><strong>${r.buyer_name}</strong><p class="muted">${r.comment || "No comment."}</p></article>`,
          )
          .join("")
      : '<div class="panel empty">No reviews yet.</div>';
  } catch (e) {
    centerDetail.innerHTML = `<div class="notice error">${e.message}</div>`;
  }
});