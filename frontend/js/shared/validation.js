window.KrestValidation = {
  email(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
  password(v){ return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(v); }
};
