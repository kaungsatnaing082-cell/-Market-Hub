const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const sellerMiddleware =
    require("../middleware/sellerMiddleware");

const {
    productUpload,
    profileUpload,
    coverUpload,
    centerProfileUpload,
    centerCoverUpload
} = require("../middleware/uploadMiddleware");


/* =========================================================
   HELPER
========================================================= */

function sendUploadResponse(req, res, folder) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please choose an image to upload."
        });
    }

    const imageUrl =
        `/uploads/${folder}/${req.file.filename}`;

    return res.status(201).json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl,
        fileName: req.file.filename
    });
}


/* =========================================================
   PROFILE PICTURE
   Seller + Buyer can use this
========================================================= */

router.post(
    "/profile",
    authMiddleware,
    profileUpload.single("image"),
    (req, res) => {
        sendUploadResponse(
            req,
            res,
            "profiles"
        );
    }
);


/* =========================================================
   COVER PHOTO
   Seller + Buyer can use this
========================================================= */

router.post(
    "/cover",
    authMiddleware,
    coverUpload.single("image"),
    (req, res) => {
        sendUploadResponse(
            req,
            res,
            "covers"
        );
    }
);


/* =========================================================
   PRODUCT IMAGE
   Seller only
========================================================= */

router.post(
    "/product",
    authMiddleware,
    sellerMiddleware,
    productUpload.single("image"),
    (req, res) => {
        sendUploadResponse(
            req,
            res,
            "products"
        );
    }
);


/* =========================================================
   CENTER PROFILE IMAGE
   Seller only
========================================================= */

router.post(
    "/center-profile",
    authMiddleware,
    sellerMiddleware,
    centerProfileUpload.single("image"),
    (req, res) => {
        sendUploadResponse(
            req,
            res,
            "center-profiles"
        );
    }
);


/* =========================================================
   CENTER COVER IMAGE
   Seller only
========================================================= */

router.post(
    "/center-cover",
    authMiddleware,
    sellerMiddleware,
    centerCoverUpload.single("image"),
    (req, res) => {
        sendUploadResponse(
            req,
            res,
            "center-covers"
        );
    }
);


module.exports = router;