document.addEventListener("DOMContentLoaded",()=>{
  const token=new URLSearchParams(location.search).get("token")||"";
  document.getElementById("token").value=token;
  document.querySelectorAll("[data-password-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
    const input=document.getElementById(btn.dataset.passwordToggle);
    input.type=input.type==="password"?"text":"password";
    btn.textContent=input.type==="password"?"Show":"Hide";
  }));
  document.getElementById("resetForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const password=document.getElementById("password").value,confirmPassword=document.getElementById("confirmPassword").value,msg=document.getElementById("message");
    if(password!==confirmPassword)return KrestUI.showMessage(msg,"Passwords do not match.");
    if(!KrestValidation.password(password))return KrestUI.showMessage(msg,"Password must be 8+ characters with upper, lower and number.");
    try{
      const data=await KrestAPI("/auth/reset-password",{method:"POST",body:JSON.stringify({token:document.getElementById("token").value.trim(),password})});
      KrestUI.showMessage(msg,data.message,"success");
      setTimeout(()=>location.href="/pages/auth/login.html",800);
    }catch(err){KrestUI.showMessage(msg,err.message)}
  });
});
