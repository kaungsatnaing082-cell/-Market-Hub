document.addEventListener("DOMContentLoaded", async() => {
    try {
        const d = await KrestAPI("/seller/finance");
        document.getElementById("grossSales").textContent = KrestUI.money(
            d.grossSales,
        );
        document.getElementById("commission").textContent = KrestUI.money(
            d.platformCommission,
        );
        document.getElementById("netSales").textContent = KrestUI.money(d.netSales);
        document.getElementById("commissionRate").textContent =
            `${d.commissionRate}%`;
        document.getElementById("agreementText").textContent =
            d.agreementStatus === "ACTIVE" ?
            "Your seller agreement is active." :
            "No active agreement is recorded yet.";
    } catch (e) {
        document.getElementById("agreementText").textContent = e.message;
    }
});