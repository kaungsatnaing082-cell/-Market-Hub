document.addEventListener("DOMContentLoaded",()=>{
  const form=document.getElementById("forgotForm");
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    try{
      const data=await KrestAPI("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:document.getElementById("email").value.trim()})});
      KrestUI.showMessage(document.getElementById("message"),data.message,"success");
      const box=document.getElementById("demoResetBox");
      if(data.demoResetUrl){
        box.hidden=false;
        document.getElementById("demoResetLink").href=data.demoResetUrl;
      }else box.hidden=true;
    }catch(err){KrestUI.showMessage(document.getElementById("message"),err.message)}
  });
});
