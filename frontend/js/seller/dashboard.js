document.addEventListener("DOMContentLoaded",async()=>{
  const msg=document.getElementById("sellerMessage");
  try{
    const d=await KrestAPI("/seller/dashboard"),c=d.center;
    const statusEl=document.getElementById("centerStatus");
    if(!c){
      statusEl.innerHTML=KrestUI.badge(d.request?.status||"NO CENTER");
      document.getElementById("centerName").textContent=d.request?.center_name||"No approved center yet";
      document.getElementById("centerDescription").textContent=d.request?"Your request is under Admin review.":"Submit a center request to begin selling.";
      ["mProducts","mStock","mOrders"].forEach(x=>document.getElementById(x).textContent="0");
      document.getElementById("mRating").textContent="—";
      document.getElementById("recentOrders").innerHTML='<tr><td colspan="5" class="empty">No orders yet.</td></tr>';
      return;
    }
    statusEl.innerHTML=KrestUI.badge(c.status);
    document.getElementById("centerName").textContent=c.name;
    document.getElementById("centerDescription").textContent=c.description||"Approved Krest Center";
    const logo=document.getElementById("centerLogo");
    logo.innerHTML=c.profile_image
      ? `<img src="${KrestUI.escape(c.profile_image)}" alt="${KrestUI.escape(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
      : KrestUI.escape(c.name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase());
    document.getElementById("mProducts").textContent=d.metrics.activeProducts;
    document.getElementById("mStock").textContent=d.metrics.totalStock;
    document.getElementById("mOrders").textContent=d.metrics.pendingOrders;
    document.getElementById("mRating").textContent=Number(d.metrics.averageRating||0).toFixed(1);
    document.getElementById("recentOrders").innerHTML=d.recentOrders.length
      ? d.recentOrders.map(o=>`<tr><td><strong>#${o.id}</strong></td><td>${KrestUI.escape(o.buyer_name)}</td><td>${KrestUI.money(o.total_amount)}</td><td>${KrestUI.badge(o.status)}</td><td>${KrestUI.date(o.created_at)}</td></tr>`).join("")
      : '<tr><td colspan="5" class="empty">No orders yet.</td></tr>';
  }catch(e){KrestUI.showMessage(msg,e.message)}
});
