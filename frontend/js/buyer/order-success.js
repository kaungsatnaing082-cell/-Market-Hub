document.addEventListener("DOMContentLoaded", () => {
    const ids = new URLSearchParams(location.search).get("orders");
    if (ids)
        successText.textContent = `Order reference${ids.includes(",") ? "s" : ""}: ${ids
      .split(",")
      .map((x) => "#" + x)
      .join(", ")}. Sellers will process each center order separately.`;
});