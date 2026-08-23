document.addEventListener("DOMContentLoaded", async () => {
  try{
    const data=await KrestAPI("/admin/dashboard");
    kpiPending.textContent=data.stats.pendingCenterRequests;
    kpiCenters.textContent=data.stats.activeCenters;
    kpiBuyers.textContent=data.stats.buyers;
    kpiReports.textContent=data.stats.openReports;
    requestRows.innerHTML=data.latestRequests.length?data.latestRequests.map(r=>`<tr><td><strong>${r.center_name}</strong></td><td>${r.seller_name}</td><td>${KrestUI.badge(r.status)}</td><td>${KrestUI.date(r.created_at)}</td></tr>`).join(""):`<tr><td colspan="4" class="empty">No requests yet.</td></tr>`;
  }catch(err){requestRows.innerHTML=`<tr><td colspan="4">${err.message}</td></tr>`}
});
