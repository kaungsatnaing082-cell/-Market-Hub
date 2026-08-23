const router = require("express").Router();

const marketplaceController =
    require("../../controllers/public/marketplaceController");


router.get(
    "/stats",
    marketplaceController.stats
);

router.get(
    "/products",
    marketplaceController.products
);

router.get(
    "/products/:id",
    marketplaceController.product
);

router.get(
    "/categories",
    marketplaceController.categories
);

router.get(
    "/centers",
    marketplaceController.centers
);

router.get(
    "/centers/:id",
    marketplaceController.center
);

router.get(
    "/search",
    marketplaceController.search
);


module.exports = router;