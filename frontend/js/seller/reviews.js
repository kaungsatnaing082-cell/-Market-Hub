document.addEventListener("DOMContentLoaded", async() => {
            const list = document.getElementById("reviewList");
            try {
                const d = await KrestAPI("/seller/reviews");
                document.getElementById("avgRating").textContent = Number(
                    d.summary.averageRating || 0,
                ).toFixed(1);
                document.getElementById("reviewCount").textContent = d.summary.totalReviews;
                document.getElementById("fiveStar").textContent = d.summary.fiveStarReviews;
                document.getElementById("recentCount").textContent = d.reviews.length;
                list.innerHTML = d.reviews.length ?
                    d.reviews
                    .map(
                        (r) =>
                        `<article class="card review-card"><div class="review-head"><div><strong>${r.buyer_name}</strong><div class="rating">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div></div><span class="muted">${KrestUI.date(r.created_at)}</span></div><p style="margin-top:12px">${r.comment || "No written comment."}</p><div class="muted" style="margin-top:8px">${r.product_name ? `Product: ${r.product_name}` : "Center review"}</div></article>`,
          )
          .join("")
      : '<div class="panel empty">No reviews yet.</div>';
  } catch (e) {
    list.innerHTML = `<div class="notice error">${e.message}</div>`;
  }
});