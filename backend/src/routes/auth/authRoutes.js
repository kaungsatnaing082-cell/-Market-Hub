const router=require("express").Router();
const c=require("../../controllers/auth/authController");
router.post("/register",c.register);
router.post("/login",c.login);
router.post("/admin-login",c.adminLogin);
router.post("/forgot-password",c.forgotPassword);
router.post("/reset-password",c.resetPassword);
module.exports=router;
