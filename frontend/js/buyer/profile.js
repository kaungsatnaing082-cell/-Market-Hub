document.addEventListener("DOMContentLoaded", async() => {
            try {
                const d = await KrestAPI("/buyer/me"),
                    u = d.user,
                    p = d.profile;
                profileView.innerHTML = `<div class="profile-cover">${u.cover_image ? `<img src="${u.cover_image}" alt="Cover" style="width:100%;height:100%;object-fit:cover;border-radius:24px">` : ""}<div class="profile-avatar">${
      u.profile_image
        ? `<img src="${u.profile_image}" alt="${u.name}">`
        : u.name
            .split(/\s+/)
            .map((x) => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
    }</div></div><div class="panel"><div class="panel-title"><div><h2>${u.name}</h2><div class="muted">${u.email}</div></div><a class="btn btn-primary" href="/pages/buyer/edit-profile.html">Edit profile</a></div><div class="definition"><dt>Phone</dt><dd>${u.phone || "—"}</dd></div><div class="definition"><dt>Bio</dt><dd>${p.bio || "—"}</dd></div><div class="definition"><dt>Default address</dt><dd>${p.default_address || "—"}</dd></div></div>`;
  } catch (e) {
    profileView.innerHTML = `<div class="notice error">${e.message}</div>`;
  }
});