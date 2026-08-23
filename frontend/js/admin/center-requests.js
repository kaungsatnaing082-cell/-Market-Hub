let requests=[];
function render(){
  const q=search.value.toLowerCase(), s=status.value;
  const list=requests.filter(r=>(!q || `${r.center_name} ${r.seller_name}`.toLowerCase().includes(q)) && (!s || r.status===s));
  rows.innerHTML=list.length?list.map(r=>`<tr><td>#${r.id}</td><td><strong>${r.center_name}</strong></td><td>${r.seller_name}</td><td>${r.category}</td><td>${KrestUI.badge(r.status)}</td><td>${KrestUI.date(r.created_at)}</td><td><a class="btn btn-secondary" href="/pages/admin/center-request-detail.html?id=${r.id}">Review</a></td></tr>`).join(""):`<tr><td colspan="7" class="empty">No matching requests.</td></tr>`;
}
document.addEventListener("DOMContentLoaded",async()=>{try{requests=(await KrestAPI("/admin/center-requests")).requests;render()}catch(e){rows.innerHTML=`<tr><td colspan="7">${e.message}</td></tr>`} search.oninput=render;status.onchange=render;});
