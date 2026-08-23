document.addEventListener("DOMContentLoaded", async() => {
            const box = document.getElementById("centerProfile");
            try {
                const c = (await KrestAPI("/seller/center")).center;
                if (!c) {
                    box.innerHTML =
                        '<div class="notice">Your center is not approved yet. <a href="/pages/seller/center-request-status.html" style="color:var(--primary);font-weight:800">Check request status</a>.</div>';
                    return;
                }
                box.innerHTML = `<section class="seller-banner" ${c.cover_image ? `style="background-image:linear-gradient(rgba(15,23,42,.58),rgba(15,23,42,.58)),url('${KrestUI.escape(c.cover_image)}');background-size:cover;background-position:center"` : ""}><div class="center-logo">${
      c.profile_image
        ? `<img src="${KrestUI.escape(c.profile_image)}" alt="${KrestUI.escape(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
        : c.name
            .split(/\s+/)
            .map((x) => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
    }</div><div><span class="badge success">${c.status}</span><h2 style="font-size:2rem;margin-top:10px">${c.name}</h2><p>${c.description || ""}</p></div><div class="seller-actions"><a class="btn btn-secondary" href="/pages/seller/edit-center.html">Edit profile</a></div></section><div class="grid grid-3" style="margin-top:18px"><div class="card card-body"><strong>Category</strong><p class="muted">${c.category}</p></div><div class="card card-body"><strong>Location</strong><p class="muted">${c.location || "Not set"}</p></div><div class="card card-body"><strong>Rating</strong><p class="muted">${Number(c.rating || 0).toFixed(1)} / 5</p></div></div>`;
  } catch (e) {
    box.innerHTML = `<div class="notice error">${e.message}</div>`;
  }
});