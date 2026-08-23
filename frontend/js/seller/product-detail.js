document.addEventListener("DOMContentLoaded", async() => {
            const box = document.getElementById("productDetail"),
                id = new URLSearchParams(location.search).get("id");
            try {
                const p = (await KrestAPI(`/seller/products/${id}`)).product;
                box.innerHTML = `<div class="detail-grid">
                    <section class="panel"><div class="product-visual" style="aspect-ratio:16/9;font-size:5rem">${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">` : "📦"}</div></section>
                    <section class="panel">
                        <div class="panel-title"><h2>${p.name}  </h2>${KrestUI.badge(p.status)}</div>
                        <div class="definition"><dt>Category</dt><dd>${p.category}</dd></div>
                        <div class="definition"><dt>SKU</dt><dd>${p.sku || "—"}</dd></div>
                        <div class="definition"><dt>Price</dt><dd>${KrestUI.money(p.price)}</dd></div>
                        <div class="definition"><dt>Stock</dt><dd>${p.stock}</dd></div>
                        <div class="definition"><dt>Description</dt><dd>${p.description || "—"}</dd></div>
                        <a class="btn btn-primary" style="margin-top:16px" href="/pages/seller/edit-product.html?id=${p.id}">Edit product</a>
                    </section>
                </div>`;
            } catch (e) {
                box.innerHTML = `<div class="notice error">${e.message}</div>`;
            }
        });