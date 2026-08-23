let rating = 5;

function paint() {
    document
        .querySelectorAll("#stars button")
        .forEach((b) =>
            b.classList.toggle("active", Number(b.dataset.rating) <= rating),
        );
}
document.addEventListener("DOMContentLoaded", () => {
    const p = new URLSearchParams(location.search);
    type.value = p.get("type") || "PRODUCT";
    targetId.value = p.get("id") || "";
    document.querySelectorAll("#stars button").forEach(
        (b) =>
        (b.onclick = () => {
            rating = Number(b.dataset.rating);
            paint();
        }),
    );
    paint();
    reviewForm.onsubmit = async(e) => {
        e.preventDefault();
        try {
            await KrestAPI("/buyer/reviews", {
                method: "POST",
                body: JSON.stringify({
                    type: type.value,
                    targetId: Number(targetId.value),
                    rating,
                    comment: comment.value.trim(),
                }),
            });
            KrestUI.showMessage(message, "Review submitted.", "success");
            setTimeout(() => (location.href = "/pages/buyer/reviews.html"), 600);
        } catch (err) {
            KrestUI.showMessage(message, err.message);
        }
    };
});