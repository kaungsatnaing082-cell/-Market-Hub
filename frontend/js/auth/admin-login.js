document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("[data-password-toggle]")?.addEventListener("click", e => {
    const input=document.getElementById("password"); input.type=input.type==="password"?"text":"password"; e.currentTarget.textContent=input.type==="password"?"Show":"Hide";
  });
  document.getElementById("adminLoginForm").addEventListener("submit", async e => {
    e.preventDefault(); const msg=document.getElementById("message");
    try{
      const data=await KrestAPI("/auth/admin-login",{method:"POST",body:JSON.stringify({email:email.value.trim(),password:password.value})});
      KrestStorage.setAuth(data.token,data.user); location.href="/pages/admin/dashboard.html";
    }catch(err){KrestUI.showMessage(msg,err.message)}
  });
});
