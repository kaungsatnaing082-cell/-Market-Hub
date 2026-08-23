document.addEventListener("DOMContentLoaded", async() => {
    const box = document.getElementById("statusBox");
    try {
        const r = (await KrestAPI("/seller/center-request")).request;
        if (!r) {
            box.innerHTML =
                '<h2>No request yet</h2><p class="muted" style="margin:8px 0 16px">Create a request to start Admin approval.</p><a class="btn btn-primary" href="/pages/seller/center-request.html">Create request</a>';
            return;
        }
        box.innerHTML = `<div class="panel-title"><h2>${r.center_name}</h2>${KrestUI.badge(r.status)}</div><div class="definition"><dt>Category</dt><dd>${r.category}</dd></div><div class="definition"><dt>Location</dt><dd>${r.location || "—"}</dd></div><div class="definition"><dt>Submitted</dt><dd>${KrestUI.date(r.created_at)}</dd></div><div class="definition"><dt>Admin note</dt><dd>${r.admin_note || "No note yet."}</dd></div>${r.status === "APPROVED" ? '<a class="btn btn-primary" style="margin-top:16px" href="/pages/seller/dashboard.html">Go to dashboard</a>' : ""}`;
    } catch (e) {
        box.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
});