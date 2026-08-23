async function load() {
    try {
        const d = await KrestAPI("/buyer/notifications");
        notificationList.innerHTML = d.notifications.length ?
            d.notifications
            .map(
                (n) =>
                `<article class="card card-body" style="${n.is_read ? "" : "border-color:#93c5fd"}"><strong>${n.title}</strong><p class="muted">${n.message}</p><small class="muted">${KrestUI.date(n.created_at)}</small></article>`,
            )
            .join("") :
            '<div class="panel empty">No notifications.</div>';
    } catch (e) {
        notificationList.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    load();
    markAllRead.onclick = async() => {
        try {
            await KrestAPI("/buyer/notifications/read-all", { method: "PATCH" });
            load();
        } catch {}
    };
});