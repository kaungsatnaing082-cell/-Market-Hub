(async function(){
  const user=KrestStorage.getUser(), token=KrestStorage.getToken();
  if(!user || !token || user.role!=="ADMIN"){ location.href="/pages/auth/admin-login.html"; return; }
  try{ await KrestAPI("/admin/me"); }catch{ KrestStorage.clearAuth(); location.href="/pages/auth/admin-login.html"; }
})();
