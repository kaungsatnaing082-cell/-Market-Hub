document.addEventListener("DOMContentLoaded", () => {
  const roleFromUrl = new URLSearchParams(location.search).get("role");
  if (roleFromUrl && ["BUYER","SELLER"].includes(roleFromUrl)) document.getElementById("role").value = roleFromUrl;

  document.querySelector("[data-password-toggle]")?.addEventListener("click", e => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
    e.currentTarget.textContent = input.type === "password" ? "Show" : "Hide";
  });

  document.getElementById("registerForm").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("message");
    const payload = {
      role: document.getElementById("role").value,
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    };
    if (!KrestValidation.email(payload.email)) return KrestUI.showMessage(msg,"Enter a valid email.");
    if (!KrestValidation.password(payload.password)) return KrestUI.showMessage(msg,"Password must be 8+ characters with upper, lower and number.");
    try {
      const data = await KrestAPI("/auth/register",{method:"POST",body:JSON.stringify(payload)});
      KrestStorage.setAuth(data.token,data.user);
      KrestUI.showMessage(msg,"Account created successfully.","success");
      const target=data.user.role==="SELLER"?"/pages/seller/dashboard.html":"/pages/buyer/dashboard.html";
      setTimeout(()=>location.href=target,450);
    } catch(err){ KrestUI.showMessage(msg,err.message); }
  });
});
