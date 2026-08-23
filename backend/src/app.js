require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const error = require("./middleware/errorMiddleware");

const app = express();

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());

app.use(express.json({ limit: "2mb" }));

app.use(express.urlencoded({ extended: true }));

/* =========================================================
   UPLOADED IMAGES
   Browser URL example:
   http://localhost:5000/uploads/products/example.jpg
========================================================= */

app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Krest Center API is running"
    });
});

/* =========================================================
   AUTH ROUTES
========================================================= */

app.use(
    "/api/auth",
    require("./routes/auth/authRoutes")
);

/* =========================================================
   PUBLIC MARKETPLACE ROUTES
========================================================= */

app.use(
    "/api/marketplace",
    require("./routes/public/marketplaceRoutes")
);

/* =========================================================
   IMAGE UPLOAD ROUTES

   POST /api/uploads/product
   POST /api/uploads/profile
   POST /api/uploads/cover
   POST /api/uploads/center-profile
   POST /api/uploads/center-cover
========================================================= */

app.use(
    "/api/uploads",
    require("./routes/uploadRoutes")
);

/* =========================================================
   ADMIN ROUTES
========================================================= */

app.use(
    "/api/admin",
    require("./routes/admin/adminRoutes")
);

app.use(
    "/api/admin/center-requests",
    require("./routes/admin/centerRequestRoutes")
);

app.use(
    "/api/admin/reports",
    require("./routes/admin/reportRoutes")
);

/* =========================================================
   SELLER ROUTES
========================================================= */

app.use(
    "/api/seller",
    require("./routes/seller/sellerRoutes")
);

app.use(
    "/api/seller",
    require("./routes/seller/centerRoutes")
);

app.use(
    "/api/seller/products",
    require("./routes/seller/productRoutes")
);

app.use(
    "/api/seller/orders",
    require("./routes/seller/orderRoutes")
);

app.use(
    "/api/seller/reviews",
    require("./routes/seller/reviewRoutes")
);

app.use(
    "/api/seller/analytics",
    require("./routes/seller/analyticsRoutes")
);

/* =========================================================
   BUYER ROUTES
========================================================= */

app.use(
    "/api/buyer",
    require("./routes/buyer/buyerRoutes")
);

app.use(
    "/api/buyer/cart",
    require("./routes/buyer/cartRoutes")
);

app.use(
    "/api/buyer/orders",
    require("./routes/buyer/orderRoutes")
);

app.use(
    "/api/buyer/wishlist",
    require("./routes/buyer/wishlistRoutes")
);

app.use(
    "/api/buyer/reviews",
    require("./routes/buyer/reviewRoutes")
);

app.use(
    "/api/buyer/reports",
    require("./routes/buyer/reportRoutes")
);

/* =========================================================
   BUYER CHECKOUT
========================================================= */

app.post(
    "/api/buyer/checkout",
    require("./middleware/authMiddleware"),
    require("./middleware/buyerMiddleware"),
    require("./controllers/buyer/cartController").checkout
);

/* =========================================================
   FRONTEND STATIC FILES
========================================================= */

app.use(
    express.static(
        path.join(__dirname, "../../frontend")
    )
);

/* =========================================================
   API 404
========================================================= */

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(error);

module.exports = app;