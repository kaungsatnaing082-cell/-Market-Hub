document.addEventListener("DOMContentLoaded", () => {
    const p = new URLSearchParams(location.search);
    if (p.get("type")) targetType.value = p.get("type");
    if (p.get("id")) targetId.value = p.get("id");
    reportForm.onsubmit = async(e) => {
        e.preventDefault();
        try {
            await KrestAPI("/buyer/reports", {
                method: "POST",
                body: JSON.stringify({
                    targetType: targetType.value,
                    targetId: Number(targetId.value),
                    reason: reason.value,
                    details: details.value.trim(),
                    evidenceUrl: evidenceUrl.value.trim(),
                }),
            });
            KrestUI.showMessage(message, "Report submitted to Admin.", "success");
            setTimeout(() => (location.href = "/pages/buyer/reports.html"), 600);
        } catch (err) {
            KrestUI.showMessage(message, err.message);
        }
    };
});