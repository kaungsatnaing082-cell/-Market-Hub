(async function() {
    const u = KrestStorage.getUser(),
        t = KrestStorage.getToken();
    if (!u || !t || u.role !== "BUYER") {
        location.href = "/pages/auth/login.html";
        return;
    }
    try {
        await KrestAPI("/buyer/me");
    } catch {
        KrestStorage.clearAuth();
        location.href = "/pages/auth/login.html";
    }
})();