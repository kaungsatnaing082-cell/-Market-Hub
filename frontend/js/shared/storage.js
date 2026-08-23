window.KrestStorage = {
  setAuth(token, user) {
    localStorage.setItem(KREST_CONFIG.tokenKey, token);
    localStorage.setItem(KREST_CONFIG.userKey, JSON.stringify(user));
  },
  getToken() { return localStorage.getItem(KREST_CONFIG.tokenKey); },
  getUser() {
    try { return JSON.parse(localStorage.getItem(KREST_CONFIG.userKey) || "null"); }
    catch { return null; }
  },
  clearAuth() {
    localStorage.removeItem(KREST_CONFIG.tokenKey);
    localStorage.removeItem(KREST_CONFIG.userKey);
  }
};
