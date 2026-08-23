const id=new URLSearchParams(location.search).get("id");
async function load(){
  try{
    const r=(await KrestAPI(`/admin/center-requests/${id}`)).request;
    requestStatus.innerHTML=KrestUI.badge(r.status);
    approve.disabled=r.status!=='PENDING';reject.disabled=r.status!=='PENDING';
    details.innerHTML=[
      ["Center name",r.center_name],["Seller",r.seller_name],["Email",r.seller_email],["Category",r.category],
      ["Location",r.location||"—"],["Phone",r.phone||"—"],["Description",r.description||"—"],["Submitted",KrestUI.date(r.created_at)]
    ].map(([k,v])=>`<div class="definition"><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  }catch(e){KrestUI.showMessage(message,e.message)}
}
async function decide(decision){
  try{
    await KrestAPI(`/admin/center-requests/${id}/decision`,{method:"PATCH",body:JSON.stringify({decision,note:note.value.trim()})});
    KrestUI.showMessage(message,`Request ${decision.toLowerCase()} successfully.`,"success"); load();
  }catch(e){KrestUI.showMessage(message,e.message)}
}
document.addEventListener("DOMContentLoaded",()=>{load();approve.onclick=()=>decide("APPROVED");reject.onclick=()=>decide("REJECTED")});
