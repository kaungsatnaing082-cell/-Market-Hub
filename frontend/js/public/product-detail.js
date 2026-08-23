document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");
  const container = document.getElementById("publicProductDetail");
  if (!id) {
    container.innerHTML = '<div class="notice error">Choose a product first.</div>';
    return;
  }

  const e = KrestUI.escape;
  const formatOptionNumber = (value) =>
    Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });

  function variantLabel(variant) {
    const parts = [];
    if (variant.color) parts.push(variant.color);
    if (variant.size) parts.push(`Size ${variant.size}`);
    if (variant.weight_value !== null && variant.weight_value !== undefined) parts.push(`${formatOptionNumber(variant.weight_value)} ${variant.weight_unit || ""}`.trim());
    if (variant.volume_value !== null && variant.volume_value !== undefined) parts.push(`${formatOptionNumber(variant.volume_value)} ${variant.volume_unit || ""}`.trim());
    return parts.join(" / ") || "Product option";
  }

  try {
    const data = await KrestAPI(`/marketplace/products/${id}`);
    const product = data.product;
    const variants = Array.isArray(data.variants)
      ? data.variants.filter((variant) => variant.status !== "DISABLED")
      : [];

    const priceText = variants.length
      ? (() => {
          const prices = variants.map((variant) =>
            variant.variant_price === null || variant.variant_price === undefined
              ? Number(product.price)
              : Number(variant.variant_price),
          );
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? KrestUI.money(min) : `${KrestUI.money(min)} – ${KrestUI.money(max)}`;
        })()
      : KrestUI.money(product.price);

    const optionsHtml = variants.length
      ? `<div class="public-variant-preview"><strong>Available options</strong><div class="public-variant-chips">${variants
          .map(
            (variant) => `<span class="public-variant-chip ${Number(variant.stock) > 0 && variant.status === "ACTIVE" ? "" : "disabled"}">${e(variantLabel(variant))}</span>`,
          )
          .join("")}</div></div>`
      : "";

    container.innerHTML = `
      <div class="grid grid-2">
        <div class="card product-visual" style="aspect-ratio:1/1;font-size:7rem">
          ${product.image_url ? `<img src="${e(product.image_url)}" alt="${e(product.name)}" style="width:100%;height:100%;object-fit:cover">` : "📦"}
        </div>
        <div class="card card-body">
          <div>${KrestUI.badge(Number(product.stock) > 0 ? "IN STOCK" : "OUT OF STOCK")}</div>
          <h1 style="font-size:2rem;margin:12px 0 6px">${e(product.name)}</h1>
          <div class="rating">★ ${Number(product.rating || 0).toFixed(1)} · ${Number(product.review_count || 0)} reviews</div>
          <a href="/pages/public/center-detail.html?id=${Number(product.center_id)}" class="muted">Sold by ${e(product.center_name)}</a>
          <div class="price" style="font-size:2rem;margin:18px 0">${e(priceText)}</div>
          <p class="muted">${e(product.description || "No description provided.")}</p>
          ${optionsHtml}
          <div class="actions" style="margin-top:22px">
            <a class="btn btn-primary" href="/pages/auth/register.html?role=BUYER">Create buyer account</a>
            <a class="btn btn-secondary" href="/pages/auth/login.html">Log in to buy</a>
          </div>
        </div>
      </div>
      <section class="section-sm">
        <h2>Buyer reviews</h2>
        <div class="grid grid-3" style="margin-top:16px">
          ${
            data.reviews.length
              ? data.reviews
                  .map(
                    (review) => `<article class="card card-body"><div class="rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div><strong>${e(review.buyer_name)}</strong><p class="muted">${e(review.comment || "No comment.")}</p></article>`,
                  )
                  .join("")
              : '<div class="panel empty">No reviews yet.</div>'
          }
        </div>
      </section>`;
  } catch (error) {
    container.innerHTML = `<div class="notice error">${e(error.message || "Unable to load product.")}</div>`;
  }
});
