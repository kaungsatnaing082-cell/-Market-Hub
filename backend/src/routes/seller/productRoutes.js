const router = require("express").Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const sellerMiddleware =
    require("../../middleware/sellerMiddleware");

const productController =
    require("../../controllers/seller/productController");


/* =========================================================
   SELLER AUTH
========================================================= */

router.use(
    authMiddleware,
    sellerMiddleware
);


/* =========================================================
   PRODUCT LIST / CREATE
========================================================= */

// GET all seller products
router.get(
    "/",
    productController.list
);


// CREATE product
router.post(
    "/",
    productController.create
);


/* =========================================================
   PRODUCT VARIANTS
========================================================= */

/*
   GET PRODUCT VARIANTS

   GET
   /api/seller/products/12/variants
*/
router.get(
    "/:id/variants",
    productController.getVariants
);


/*
   CREATE PRODUCT VARIANT

   POST
   /api/seller/products/12/variants

   Example Body:

   Fashion:
   {
       "color": "Black",
       "size": "M",
       "variantPrice": 35000,
       "stock": 5,
       "sku": "TS-BLK-M"
   }

   Food:
   {
       "weightValue": 500,
       "weightUnit": "g",
       "variantPrice": 5000,
       "stock": 10,
       "sku": "FOOD-500G"
   }

   Beverage:
   {
       "volumeValue": 1,
       "volumeUnit": "L",
       "variantPrice": 2500,
       "stock": 15,
       "sku": "DRINK-1L"
   }
*/
router.post(
    "/:id/variants",
    productController.createVariant
);


/*
   UPDATE PRODUCT VARIANT

   PUT
   /api/seller/products/12/variants/1
*/
router.put(
    "/:id/variants/:variantId",
    productController.updateVariant
);


/*
   DELETE / DISABLE PRODUCT VARIANT

   DELETE
   /api/seller/products/12/variants/1
*/
router.delete(
    "/:id/variants/:variantId",
    productController.removeVariant
);


/* =========================================================
   PRODUCT DETAIL
========================================================= */

router.get(
    "/:id",
    productController.getOne
);


/* =========================================================
   UPDATE PRODUCT
========================================================= */

router.put(
    "/:id",
    productController.update
);


/* =========================================================
   UPDATE NORMAL PRODUCT STOCK
========================================================= */

router.patch(
    "/:id/stock",
    productController.updateStock
);


/* =========================================================
   DELETE PRODUCT
========================================================= */

router.delete(
    "/:id",
    productController.remove
);


module.exports = router;