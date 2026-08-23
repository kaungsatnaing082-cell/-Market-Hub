document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-global-search]");
  if (!form) return;
  e.preventDefault();
  const q = form.querySelector("input")?.value.trim() || "";
  location.href = `/pages/public/search-results.html?q=${encodeURIComponent(q)}`;
});
