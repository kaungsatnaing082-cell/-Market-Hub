document.addEventListener("DOMContentLoaded", async() => {
    try {
        const d = await KrestAPI("/buyer/reviews");
        const all = [
            ...d.productReviews.map((r) => ({
                ...r,
                type: "Product",
                target: r.product_name,
            })),
            ...d.centerReviews.map((r) => ({
                ...r,
                type: "Center",
                target: r.center_name,
            })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        myReviews.innerHTML = all.length ?
            all
            .map(
                (r) =>
                `<article class="card card-body"><div class="panel-title"><div><strong>${r.type}: ${r.target}</strong><div class="rating">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div></div><span class="muted">${KrestUI.date(r.created_at)}</span></div><p class="muted">${r.comment || "No comment."}</p></article>`,
            )
            .join("") :
            '<div class="panel empty">You have not written any reviews yet.</div>';
    } catch (e) {
        myReviews.innerHTML = `<div class="notice error">${e.message}</div>`;
    }
});