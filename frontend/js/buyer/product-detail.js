(() => {
  "use strict";

  const productId = new URLSearchParams(location.search).get("id");
  let product = null;
  let variants = [];
  let groups = [];
  let selected = {};
  let selectedVariant = null;

  const e = (value) => KrestUI.escape(value ?? "");

  function formatNumber(value) {
    const n = Number(value);
    return Number.isFinite(n)
      ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : String(value ?? "");
  }

  function effectivePrice(variant) {
    if (!variant) return Number(product?.price || 0);
    return variant.variant_price === null || variant.variant_price === undefined
      ? Number(product?.price || 0)
      : Number(variant.variant_price);
  }

  function variantValue(variant, type) {
    if (type === "color") return variant.color || "";
    if (type === "size") return variant.size || "";
    if (type === "weight") {
      return variant.weight_value === null || variant.weight_value === undefined
        ? ""
        : `${variant.weight_value}|${variant.weight_unit || ""}`;
    }
    if (type === "volume") {
      return variant.volume_value === null || variant.volume_value === undefined
        ? ""
        : `${variant.volume_value}|${variant.volume_unit || ""}`;
    }
    return "";
  }

  function optionLabel(type, value) {
    if (type === "weight" || type === "volume") {
      const [amount, unit] = String(value).split("|");
      return `${formatNumber(amount)} ${unit}`.trim();
    }
    return String(value);
  }

  function variantLabel(variant) {
    const parts = [];
    if (variant.color) parts.push(variant.color);
    if (variant.size) parts.push(`Size ${variant.size}`);
    if (variant.weight_value !== null && variant.weight_value !== undefined) {
      parts.push(`${formatNumber(variant.weight_value)} ${variant.weight_unit || ""}`.trim());
    }
    if (variant.volume_value !== null && variant.volume_value !== undefined) {
      parts.push(`${formatNumber(variant.volume_value)} ${variant.volume_unit || ""}`.trim());
    }
    return parts.join(" / ") || "Product option";
  }

  function isAvailable(variant) {
    return variant.status === "ACTIVE" && Number(variant.stock) > 0;
  }

  function matchesSelection(variant, selection, ignoredType = null) {
    return groups.every((group) => {
      if (group.type === ignoredType) return true;
      const wanted = selection[group.type];
      return !wanted || variantValue(variant, group.type) === wanted;
    });
  }

  function buildGroups() {
    const definitions = [
      ["color", "Color"],
      ["size", "Size"],
      ["weight", "Weight"],
      ["volume", "Volume"],
    ];

    groups = definitions
      .map(([type, label]) => {
        const values = [...new Set(variants.map((v) => variantValue(v, type)).filter(Boolean))];
        return { type, label, values };
      })
      .filter((group) => group.values.length);

    const available = variants.filter(isAvailable);
    for (const group of groups) {
      const availableValues = [
        ...new Set(available.map((v) => variantValue(v, group.type)).filter(Boolean)),
      ];
      if (availableValues.length === 1) selected[group.type] = availableValues[0];
    }
  }

  function findSelectedVariant() {
    if (!variants.length || !groups.length) return null;
    if (!groups.every((group) => selected[group.type])) return null;
    return (
      variants.find(
        (variant) =>
          isAvailable(variant) &&
          groups.every((group) => variantValue(variant, group.type) === selected[group.type]),
      ) || null
    );
  }

  function priceRange() {
    const available = variants.filter(isAvailable);
    const source = available.length ? available : variants;
    if (!source.length) return KrestUI.money(product.price);
    const prices = source.map(effectivePrice).filter(Number.isFinite);
    if (!prices.length) return KrestUI.money(product.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? KrestUI.money(min) : `${KrestUI.money(min)} – ${KrestUI.money(max)}`;
  }

  function renderProduct() {
    const productDetail = document.getElementById("productDetail");
    const hasVariants = variants.length > 0;
    const stock = Number(product.stock || 0);

    productDetail.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-main-image">
          ${
            product.image_url
              ? `<img src="${e(product.image_url)}" alt="${e(product.name)}">`
              : "📦"
          }
        </div>

        <div class="product-buybox">
          <div class="actions">${KrestUI.badge(stock > 0 ? "IN STOCK" : "OUT OF STOCK")}</div>
          <h2 style="font-size:2rem;margin:12px 0 6px">${e(product.name)}</h2>
          <div class="rating">★ ${Number(product.rating || 0).toFixed(1)} · ${Number(product.review_count || 0)} reviews</div>
          <a href="/pages/buyer/center-detail.html?id=${Number(product.center_id)}" class="muted">Sold by ${e(product.center_name)}</a>

          <div class="market-price" id="detailPrice" style="font-size:2rem;margin-top:18px">
            ${hasVariants ? e(priceRange()) : e(KrestUI.money(product.price))}
          </div>

          <p class="muted" style="margin-top:12px">${e(product.description || "No description provided.")}</p>

          ${
            hasVariants
              ? `<div class="variant-picker" id="variantPicker"></div>
                 <div class="variant-selection-note" id="variantSelectionNote">Choose an available option.</div>`
              : ""
          }

          <div class="quantity-row">
            <label class="label" for="qty" style="margin:0">Qty</label>
            <input class="input" id="qty" type="number" min="1" max="${hasVariants ? 1 : Math.max(1, stock)}" value="1" ${hasVariants ? "disabled" : ""}>
            <span class="muted" id="detailStock">${hasVariants ? "Select options to see stock" : `${stock} available`}</span>
          </div>

          <div class="actions" style="margin-top:20px">
            <button class="btn btn-primary" id="buyNowBtn" ${stock < 1 || hasVariants ? "disabled" : ""}>Buy now</button>
            <button class="btn btn-secondary" id="addCartBtn" ${stock < 1 || hasVariants ? "disabled" : ""}>Add to cart</button>
            <button class="btn btn-secondary wishlist-btn" id="wishlistBtn">♡ Wishlist</button>
            <a class="btn btn-link" href="/pages/buyer/create-report.html?type=PRODUCT&id=${Number(product.id)}">Report</a>
          </div>
        </div>
      </div>

      <div class="buyer-sticky-actions">
        <button class="btn btn-secondary" id="stickyAddCartBtn" ${stock < 1 || hasVariants ? "disabled" : ""}>Add to cart</button>
        <button class="btn btn-primary" id="stickyBuyNowBtn" ${stock < 1 || hasVariants ? "disabled" : ""}>Buy now</button>
      </div>
    `;

    if (hasVariants) {
      buildGroups();
      renderVariantPicker();
    }

    document.getElementById("addCartBtn")?.addEventListener("click", () => addCart(false));
    document.getElementById("stickyAddCartBtn")?.addEventListener("click", () => addCart(false));
    document.getElementById("buyNowBtn")?.addEventListener("click", () => addCart(true));
    document.getElementById("stickyBuyNowBtn")?.addEventListener("click", () => addCart(true));
    document.getElementById("wishlistBtn")?.addEventListener("click", toggleWishlist);
  }

  function renderVariantPicker() {
    const picker = document.getElementById("variantPicker");
    if (!picker) return;

    picker.innerHTML = groups
      .map(
        (group) => `
          <div class="variant-option-group">
            <div class="variant-option-label">${e(group.label)}</div>
            <div class="variant-option-buttons">
              ${group.values
                .map(
                  (value) => `<button type="button" class="variant-option-btn" data-option-type="${e(group.type)}" data-option-value="${e(value)}">${e(optionLabel(group.type, value))}</button>`,
                )
                .join("")}
            </div>
          </div>`,
      )
      .join("");

    picker.addEventListener("click", (event) => {
      const button = event.target.closest(".variant-option-btn");
      if (!button || button.disabled) return;
      const type = button.dataset.optionType;
      const value = button.dataset.optionValue;
      selected[type] = selected[type] === value ? "" : value;
      updateVariantPickerState();
    });

    updateVariantPickerState();
  }

  function updateVariantPickerState() {
    const available = variants.filter(isAvailable);

    document.querySelectorAll(".variant-option-btn").forEach((button) => {
      const type = button.dataset.optionType;
      const value = button.dataset.optionValue;
      const candidateSelection = { ...selected, [type]: value };
      const possible = available.some((variant) => matchesSelection(variant, candidateSelection, null));
      button.disabled = !possible;
      button.classList.toggle("selected", selected[type] === value);
    });

    selectedVariant = findSelectedVariant();

    const priceEl = document.getElementById("detailPrice");
    const stockEl = document.getElementById("detailStock");
    const noteEl = document.getElementById("variantSelectionNote");
    const qty = document.getElementById("qty");
    const actionButtons = [
      document.getElementById("addCartBtn"),
      document.getElementById("buyNowBtn"),
      document.getElementById("stickyAddCartBtn"),
      document.getElementById("stickyBuyNowBtn"),
    ].filter(Boolean);

    if (selectedVariant) {
      const stock = Number(selectedVariant.stock || 0);
      priceEl.textContent = KrestUI.money(effectivePrice(selectedVariant));
      stockEl.textContent = `${stock} available`;
      noteEl.textContent = `${variantLabel(selectedVariant)}${selectedVariant.sku ? ` · SKU ${selectedVariant.sku}` : ""}`;
      qty.disabled = false;
      qty.max = String(Math.max(1, stock));
      if (Number(qty.value) > stock || Number(qty.value) < 1) qty.value = "1";
      actionButtons.forEach((button) => (button.disabled = stock < 1));
    } else {
      priceEl.textContent = priceRange();
      stockEl.textContent = "Select options to see stock";
      noteEl.textContent = "Choose an available option.";
      qty.value = "1";
      qty.max = "1";
      qty.disabled = true;
      actionButtons.forEach((button) => (button.disabled = true));
    }
  }

  async function addCart(goToCheckout) {
    const message = document.getElementById("message");
    try {
      if (variants.length && !selectedVariant) {
        KrestUI.showMessage(message, "Please select a product option first.");
        return;
      }

      const quantity = Math.max(1, Number(document.getElementById("qty")?.value || 1));
      const body = { productId: Number(productId), quantity };
      if (selectedVariant) body.variantId = Number(selectedVariant.id);

      await KrestAPI("/buyer/cart/items", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (goToCheckout) {
        location.href = "/pages/buyer/checkout.html";
        return;
      }

      KrestUI.showMessage(message, "Added to cart.", "success");
      document.dispatchEvent(new Event("krest:cart-updated"));
    } catch (error) {
      KrestUI.showMessage(message, error.message || "Unable to add this product to cart.");
    }
  }

  async function toggleWishlist() {
    const message = document.getElementById("message");
    try {
      const data = await KrestAPI(`/buyer/wishlist/${productId}`, { method: "POST" });
      KrestUI.showMessage(message, data.message || "Wishlist updated.", "success");
    } catch (error) {
      KrestUI.showMessage(message, error.message || "Unable to update wishlist.");
    }
  }

  function renderReviews(reviews) {
    const reviewList = document.getElementById("reviewList");
    reviewList.innerHTML = reviews.length
      ? reviews
          .map(
            (review) => `
              <article class="card card-body">
                <div class="rating">${"★".repeat(Number(review.rating || 0))}${"☆".repeat(Math.max(0, 5 - Number(review.rating || 0)))}</div>
                <strong>${e(review.buyer_name)}</strong>
                <p class="muted" style="margin-top:6px">${e(review.comment || "No comment.")}</p>
              </article>`,
          )
          .join("")
      : '<div class="panel empty">No reviews yet.</div>';
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const detail = document.getElementById("productDetail");
    if (!productId) {
      detail.innerHTML = '<div class="notice error">Product ID is missing.</div>';
      return;
    }

    try {
      const data = await KrestAPI(`/marketplace/products/${productId}`);
      product = data.product;
      variants = Array.isArray(data.variants) ? data.variants.filter((v) => v.status !== "DISABLED") : [];
      renderProduct();
      renderReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) {
      detail.innerHTML = `<div class="notice error">${e(error.message || "Unable to load product.")}</div>`;
    }
  });
})();
