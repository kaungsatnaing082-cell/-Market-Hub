document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("centerRequestForm")
        .addEventListener("submit", async(e) => {
            e.preventDefault();
            const msg = document.getElementById("message");
            try {
                await KrestAPI("/seller/center-request", {
                    method: "POST",
                    body: JSON.stringify({
                        centerName: document.getElementById("centerName").value.trim(),
                        category: document.getElementById("category").value,
                        location: document.getElementById("location").value.trim(),
                        description: document.getElementById("description").value.trim(),
                        businessInfo: document.getElementById("businessInfo").value.trim(),
                    }),
                });
                KrestUI.showMessage(
                    msg,
                    "Center request submitted. Admin review is pending.",
                    "success",
                );
                setTimeout(
                    () => (location.href = "/pages/seller/center-request-status.html"),
                    600,
                );
            } catch (err) {
                KrestUI.showMessage(msg, err.message);
            }
        });
});