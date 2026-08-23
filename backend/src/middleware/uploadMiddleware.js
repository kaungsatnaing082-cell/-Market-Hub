const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/* =========================================================
   KREST CENTER - IMAGE UPLOAD MIDDLEWARE
========================================================= */

const uploadRoot = path.join(__dirname, "../../uploads");

/* =========================================================
   CREATE FOLDER IF IT DOES NOT EXIST
========================================================= */

function ensureFolder(folderName) {
    const folderPath = path.join(uploadRoot, folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {
            recursive: true
        });
    }

    return folderPath;
}

/* =========================================================
   ALLOWED IMAGE TYPES
========================================================= */

const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

function imageFilter(req, file, callback) {

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            )
        );
    }

    callback(null, true);
}

/* =========================================================
   CREATE STORAGE
========================================================= */

function createStorage(folderName) {

    return multer.diskStorage({

        destination: function(req, file, callback) {

            const folderPath = ensureFolder(folderName);

            callback(
                null,
                folderPath
            );
        },

        filename: function(req, file, callback) {

            const extension =
                path.extname(file.originalname).toLowerCase();

            const uniqueName =
                `${Date.now()}-${crypto.randomUUID()}${extension}`;

            callback(
                null,
                uniqueName
            );
        }

    });

}

/* =========================================================
   CREATE UPLOADER
========================================================= */

function createUploader(
    folderName,
    maxSize = 5 * 1024 * 1024
) {

    return multer({

        storage: createStorage(folderName),

        fileFilter: imageFilter,

        limits: {

            fileSize: maxSize,

            files: 1

        }

    });

}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

const productUpload =
    createUploader(
        "products",
        5 * 1024 * 1024
    );

/* =========================================================
   SELLER PROFILE IMAGE
========================================================= */

const profileUpload =
    createUploader(
        "profiles",
        5 * 1024 * 1024
    );

/* =========================================================
   SELLER COVER PHOTO
========================================================= */

const coverUpload =
    createUploader(
        "covers",
        8 * 1024 * 1024
    );

/* =========================================================
   CENTER PROFILE IMAGE
========================================================= */

const centerProfileUpload =
    createUploader(
        "center-profiles",
        5 * 1024 * 1024
    );

/* =========================================================
   CENTER COVER PHOTO
========================================================= */

const centerCoverUpload =
    createUploader(
        "center-covers",
        8 * 1024 * 1024
    );

/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    productUpload,

    profileUpload,

    coverUpload,

    centerProfileUpload,

    centerCoverUpload

};