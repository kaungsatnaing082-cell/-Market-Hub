const router=require("express").Router();
const auth=require("../../middleware/authMiddleware");
const admin=require("../../middleware/adminMiddleware");
const c=require("../../controllers/admin/centerRequestController");
router.use(auth,admin);
router.get("/",c.list);
router.get("/:id",c.getOne);
router.patch("/:id/decision",c.decision);
module.exports=router;
