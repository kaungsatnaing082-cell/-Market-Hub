const router = require("express").Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const buyerMiddleware =
    require("../../middleware/buyerMiddleware");

const cartController =
    require("../../controllers/buyer/cartController");


/* =========================================================
   BUYER AUTH
========================================================= */

router.use(
    authMiddleware,
    buyerMiddleware
);


/* =========================================================
   GET CART
========================================================= */

router.get(
    "/",
    cartController.get
);


/* =========================================================
   ADD PRODUCT / VARIANT TO CART

   Body example:

   {
     "productId": 12,
     "variantId": 1,
     "quantity": 2
   }

   Normal product:
   {
     "productId": 8,
     "quantity": 1
   }
========================================================= */

router.post(
    "/items",
    cartController.add
);


/* =========================================================
   UPDATE CART ITEM QUANTITY
========================================================= */

router.patch(
    "/items/:id",
    cartController.update
);


/* =========================================================
   REMOVE CART ITEM
========================================================= */

router.delete(
    "/items/:id",
    cartController.remove
);


module.exports = router;