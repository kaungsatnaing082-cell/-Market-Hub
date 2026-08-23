document.addEventListener("DOMContentLoaded", async () => {
  const rows = document.getElementById("reportRows");
  if (!rows) return;

  const e = (value) => KrestUI.escape(value ?? "");
  rows.innerHTML = '<tr><td colspan="6" class="empty">Loading reports...</td></tr>';

  try {
    const data = await KrestAPI("/buyer/reports");
    const reports = Array.isArray(data.reports) ? data.reports : [];

    rows.innerHTML = reports.length
      ? reports
          .map(
            (report) => `
              <tr>
                <td>#${Number(report.id)}</td>
                <td>${e(report.target_type)} #${Number(report.target_id)}</td>
                <td>${e(report.reason)}</td>
                <td>${KrestUI.badge(report.status)}</td>
                <td>${KrestUI.date(report.created_at)}</td>
                <td>${e(report.admin_note || "—")}</td>
              </tr>`,
          )
          .join("")
      : '<tr><td colspan="6" class="empty">No reports submitted.</td></tr>';
  } catch (error) {
    rows.innerHTML = `<tr><td colspan="6" class="empty">${e(error.message || "Unable to load reports.")}</td></tr>`;
  }
});
