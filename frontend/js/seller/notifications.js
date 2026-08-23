document.addEventListener("DOMContentLoaded", async() => {
    const list = document.getElementById("notificationList");
    try {
        const ns = (await KrestAPI("/seller/notifications")).notifications;
        list.innerHTML = ns.length ?
            ns
            .map(
                (n) =>
                `<article class="card card-body"><strong>${n.title}</strong><p class="muted">${n.message}</p><small class="muted">${KrestUI.date(n.created_at)}</small></article>`,
            )
            .join("") :
            '<div class="panel empty">No notifications.</div>';
    } catch (e) {
        list.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
});