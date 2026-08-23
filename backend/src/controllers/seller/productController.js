const db = require("../../config/db");


/* =========================================================
   GET SELLER CENTER ID
========================================================= */

async function centerId(userId, executor = db) {
    const [rows] = await executor.query(
        `
        SELECT id
        FROM centers
        WHERE seller_id=?
          AND status IN ('ACTIVE','WARNING')
        ORDER BY id DESC
        LIMIT 1
        `, [userId]
    );

    return rows.length ?
        rows[0].id :
        null;
}


/* =========================================================
   HELPER - NULLABLE TEXT
========================================================= */

function nullableText(value) {
    const text = String(value || "").trim();

    return text ?
        text :
        null;
}


/* =========================================================
   HELPER - NULLABLE NUMBER
========================================================= */

function nullableNumber(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number) ||
        number < 0
    ) {
        return NaN;
    }

    return number;
}


/* =========================================================
   NORMALIZE VARIANT
========================================================= */

function normalizeVariant(body = {}) {

    const color =
        nullableText(body.color);

    const size =
        nullableText(body.size);


    const weightValue =
        nullableNumber(
            body.weightValue ||
            body.weight_value
        );

    const weightUnit =
        nullableText(
            body.weightUnit ||
            body.weight_unit
        );


    const volumeValue =
        nullableNumber(
            body.volumeValue ||
            body.volume_value
        );

    const volumeUnit =
        nullableText(
            body.volumeUnit ||
            body.volume_unit
        );


    const variantPrice =
        nullableNumber(
            body.variantPrice ||
            body.variant_price
        );


    const stock =
        Number(
            body.stock || 0
        );


    const sku =
        nullableText(body.sku);


    return {
        color,
        size,

        weightValue,
        weightUnit,

        volumeValue,
        volumeUnit,

        variantPrice,

        stock,
        sku
    };
}


/* =========================================================
   VALIDATE VARIANT
========================================================= */

function validateVariant(variant) {

    if (!variant.color &&
        !variant.size &&
        variant.weightValue === null &&
        variant.volumeValue === null
    ) {
        return "At least one option is required: color, size, weight or volume.";
    }


    if (
        Number.isNaN(
            variant.weightValue
        )
    ) {
        return "Weight must be a valid non-negative number.";
    }


    if (
        Number.isNaN(
            variant.volumeValue
        )
    ) {
        return "Volume must be a valid non-negative number.";
    }


    if (
        Number.isNaN(
            variant.variantPrice
        )
    ) {
        return "Variant price must be a valid non-negative number.";
    }


    if (!Number.isInteger(
            variant.stock
        ) ||
        variant.stock < 0
    ) {
        return "Variant stock must be a non-negative whole number.";
    }


    /* ==============================
       WEIGHT VALIDATION
    ============================== */

    if (
        variant.weightValue !== null
    ) {

        if (!["g", "kg"].includes(
                variant.weightUnit
            )) {
            return "Weight unit must be g or kg.";
        }

    } else if (
        variant.weightUnit !== null
    ) {

        return "Weight value is required when weight unit is selected.";
    }


    /* ==============================
       VOLUME VALIDATION
    ============================== */

    if (
        variant.volumeValue !== null
    ) {

        if (!["ml", "L"].includes(
                variant.volumeUnit
            )) {
            return "Volume unit must be ml or L.";
        }

    } else if (
        variant.volumeUnit !== null
    ) {

        return "Volume value is required when volume unit is selected.";
    }


    return null;
}


/* =========================================================
   SYNC PRODUCT STOCK FROM VARIANTS
========================================================= */

async function syncProductStock(
    executor,
    productId
) {

    const [rows] =
    await executor.query(
        `
            SELECT
                COUNT(*) AS variant_count,

                COALESCE(
                    SUM(stock),
                    0
                ) AS total_stock

            FROM product_variants

            WHERE product_id=?
              AND status<>'DISABLED'
            `, [productId]
    );


    const variantCount =
        Number(
            rows[0].variant_count
        );

    const totalStock =
        Number(
            rows[0].total_stock
        );


    /*
     * If product has no active variants,
     * do not automatically convert it
     * into a normal product.
     */
    if (variantCount === 0) {

        await executor.query(
            `
            UPDATE products

            SET
                stock=0,

                status=
                    CASE
                        WHEN status IN (
                            'DRAFT',
                            'HIDDEN',
                            'DELETED'
                        )
                        THEN status

                        ELSE 'OUT_OF_STOCK'
                    END

            WHERE id=?
            `, [productId]
        );

        return;
    }


    await executor.query(
        `
        UPDATE products

        SET
            stock=?,

            status=
                CASE
                    WHEN status IN (
                        'DRAFT',
                        'HIDDEN',
                        'DELETED'
                    )
                    THEN status

                    WHEN ?>0
                    THEN 'ACTIVE'

                    ELSE 'OUT_OF_STOCK'
                END

        WHERE id=?
        `, [
            totalStock,
            totalStock,
            productId
        ]
    );
}


/* =========================================================
   PRODUCT LIST
========================================================= */

exports.list = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.json({
                success: true,
                products: []
            });
        }


        const [rows] =
        await db.query(
            `
                SELECT
                    p.*,

                    (
                        SELECT COUNT(*)

                        FROM product_variants pv

                        WHERE pv.product_id=p.id
                          AND pv.status<>'DISABLED'
                    ) AS variant_count,

                    (
                        SELECT MIN(
                            COALESCE(
                                pv.variant_price,
                                p.price
                            )
                        )

                        FROM product_variants pv

                        WHERE pv.product_id=p.id
                          AND pv.status<>'DISABLED'
                    ) AS min_variant_price,

                    (
                        SELECT MAX(
                            COALESCE(
                                pv.variant_price,
                                p.price
                            )
                        )

                        FROM product_variants pv

                        WHERE pv.product_id=p.id
                          AND pv.status<>'DISABLED'
                    ) AS max_variant_price

                FROM products p

                WHERE p.center_id=?
                  AND p.status<>'DELETED'

                ORDER BY
                    p.created_at DESC
                `, [cid]
        );


        res.json({
            success: true,
            products: rows
        });

    } catch (error) {

        next(error);
    }
};


/* =========================================================
   GET ONE PRODUCT
========================================================= */

exports.getOne = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const [rows] =
        await db.query(
            `
                SELECT *

                FROM products

                WHERE id=?
                  AND center_id=?
                  AND status<>'DELETED'

                LIMIT 1
                `, [
                req.params.id,
                cid
            ]
        );


        if (!rows.length) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        const [variants] =
        await db.query(
            `
                SELECT *

                FROM product_variants

                WHERE product_id=?
                  AND status<>'DISABLED'

                ORDER BY
                    color,
                    size,
                    weight_value,
                    volume_value,
                    id
                `, [req.params.id]
        );


        res.json({
            success: true,

            product: rows[0],

            variants
        });

    } catch (error) {

        next(error);
    }
};


/* =========================================================
   CREATE PRODUCT
========================================================= */

exports.create = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.status(403).json({
                success: false,
                message: "Your center must be approved before adding products."
            });
        }


        const {
            name,
            category,
            sku,
            price,
            stock,
            description,
            imageUrl
        } = req.body;


        const productName =
            String(
                name || ""
            ).trim();


        const productCategory =
            String(
                category || ""
            ).trim();


        const normalizedSku =
            nullableText(sku);


        const numericPrice =
            Number(price);


        const numericStock =
            Number(
                stock || 0
            );


        /* =====================================================
           VALIDATION
        ====================================================== */

        if (!productName ||
            !productCategory ||
            !Number.isFinite(
                numericPrice
            ) ||
            numericPrice < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Valid name, category and price are required."
            });
        }


        if (!Number.isInteger(
                numericStock
            ) ||
            numericStock < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number."
            });
        }


        /* =====================================================
           CHECK PRODUCT SKU
        ====================================================== */

        if (normalizedSku) {

            const [existingSku] =
            await db.query(
                `
                    SELECT id

                    FROM products

                    WHERE center_id=?
                      AND sku=?

                    LIMIT 1
                    `, [
                    cid,
                    normalizedSku
                ]
            );


            if (existingSku.length) {

                return res.status(409).json({
                    success: false,
                    message: "This SKU already exists in your center. Please use another SKU."
                });
            }
        }


        const status =
            numericStock > 0 ?
            "ACTIVE" :
            "OUT_OF_STOCK";


        const [result] =
        await db.query(
            `
                INSERT INTO products
                (
                    center_id,
                    name,
                    category,
                    sku,
                    price,
                    stock,
                    description,
                    image_url,
                    status
                )

                VALUES(
                    ?,?,?,?,?,?,?,?,?
                )
                `, [
                cid,
                productName,
                productCategory,
                normalizedSku,
                numericPrice,
                numericStock,

                description ?
                String(
                    description
                ).trim() :
                null,

                imageUrl || null,

                status
            ]
        );


        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            productId: result.insertId
        });

    } catch (error) {

        const message =
            String(
                error.sqlMessage ||
                error.message ||
                ""
            );


        if (
            error.code ===
            "ER_DUP_ENTRY" &&
            message.includes(
                "uk_center_sku"
            )
        ) {

            return res.status(409).json({
                success: false,
                message: "This SKU already exists in your center. Please use another SKU."
            });
        }


        next(error);
    }
};


/* =========================================================
   UPDATE PRODUCT
========================================================= */

exports.update = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const {
            name,
            category,
            price,
            status,
            description,
            imageUrl
        } = req.body;


        const allowed = [
            "ACTIVE",
            "DRAFT",
            "HIDDEN",
            "OUT_OF_STOCK"
        ];


        const productName =
            String(
                name || ""
            ).trim();


        const productCategory =
            String(
                category || ""
            ).trim();


        const numericPrice =
            Number(price);


        if (!allowed.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid product status"
            });
        }


        if (!productName ||
            !productCategory ||
            !Number.isFinite(
                numericPrice
            ) ||
            numericPrice < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Valid name, category and price are required"
            });
        }


        const [current] =
        await db.query(
            `
                SELECT stock

                FROM products

                WHERE id=?
                  AND center_id=?
                  AND status<>'DELETED'

                LIMIT 1
                `, [
                req.params.id,
                cid
            ]
        );


        if (!current.length) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        const finalStatus =
            status === "ACTIVE" &&
            Number(
                current[0].stock
            ) === 0

            ?
            "OUT_OF_STOCK" :
            status;


        await db.query(
            `
            UPDATE products

            SET
                name=?,
                category=?,
                price=?,
                status=?,
                description=?,
                image_url=?

            WHERE id=?
              AND center_id=?
            `, [
                productName,
                productCategory,
                numericPrice,
                finalStatus,

                description ?
                String(
                    description
                ).trim() :
                null,

                imageUrl || null,

                req.params.id,
                cid
            ]
        );


        res.json({
            success: true,
            message: "Product updated",
            status: finalStatus
        });

    } catch (error) {

        next(error);
    }
};


/* =========================================================
   UPDATE NORMAL PRODUCT STOCK
========================================================= */

exports.updateStock = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const productId =
            Number(
                req.params.id
            );


        /* =====================================================
           CHECK VARIANTS
        ====================================================== */

        const [
            [variantResult]
        ] =
        await db.query(
            `
                SELECT COUNT(*) AS count

                FROM product_variants pv

                JOIN products p
                    ON p.id=pv.product_id

                WHERE pv.product_id=?
                  AND p.center_id=?
                  AND pv.status<>'DISABLED'
                `, [
                productId,
                cid
            ]
        );


        if (
            Number(
                variantResult.count
            ) > 0
        ) {

            return res.status(400).json({
                success: false,
                message: "This product uses variants. Update the stock of each variant instead."
            });
        }


        const stock =
            Number(
                req.body.stock
            );


        if (!Number.isInteger(stock) ||
            stock < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number"
            });
        }


        const newStatus =
            stock === 0 ?
            "OUT_OF_STOCK" :
            "ACTIVE";


        const [result] =
        await db.query(
            `
                UPDATE products

                SET
                    stock=?,

                    status=
                        IF(
                            status IN (
                                'DRAFT',
                                'HIDDEN'
                            ),
                            status,
                            ?
                        )

                WHERE id=?
                  AND center_id=?
                  AND status<>'DELETED'
                `, [
                stock,
                newStatus,
                productId,
                cid
            ]
        );


        if (!result.affectedRows) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.json({
            success: true,
            message: "Stock updated"
        });

    } catch (error) {

        next(error);
    }
};


/* =========================================================
   DELETE PRODUCT
========================================================= */

exports.remove = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const [result] =
        await db.query(
            `
                UPDATE products

                SET status='DELETED'

                WHERE id=?
                  AND center_id=?
                  AND status<>'DELETED'
                `, [
                req.params.id,
                cid
            ]
        );


        if (!result.affectedRows) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.json({
            success: true,
            message: "Product deleted"
        });

    } catch (error) {

        next(error);
    }
};


/* =========================================================
   GET PRODUCT VARIANTS
========================================================= */

exports.getVariants = async(
    req,
    res,
    next
) => {

    try {

        const cid =
            await centerId(
                req.user.id
            );


        if (!cid) {

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const [productRows] =
        await db.query(
            `
                SELECT id

                FROM products

                WHERE id=?
                  AND center_id=?
                  AND status<>'DELETED'

                LIMIT 1
                `, [
                req.params.id,
                cid
            ]
        );


        if (!productRows.length) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        const [variants] =
        await db.query(
            `
                SELECT *

                FROM product_variants

                WHERE product_id=?
                  AND status<>'DISABLED'

                ORDER BY
                    color,
                    size,
                    weight_value,
                    volume_value,
                    id
                `, [req.params.id]
        );


        res.json({
            success: true,
            variants
        });

    } catch (error) {

        next(error);
    }
};


/* =========================================================
   CREATE PRODUCT VARIANT
========================================================= */

exports.createVariant = async(
    req,
    res,
    next
) => {

    const conn =
        await db.getConnection();


    try {

        await conn.beginTransaction();


        const cid =
            await centerId(
                req.user.id,
                conn
            );


        if (!cid) {

            await conn.rollback();

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const productId =
            Number(
                req.params.id
            );


        const [products] =
        await conn.query(
            `
                SELECT id

                FROM products

                WHERE id=?
                  AND center_id=?
                  AND status<>'DELETED'

                LIMIT 1

                FOR UPDATE
                `, [
                productId,
                cid
            ]
        );


        if (!products.length) {

            await conn.rollback();

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        const variant =
            normalizeVariant(
                req.body
            );


        const validationError =
            validateVariant(
                variant
            );


        if (validationError) {

            await conn.rollback();

            return res.status(400).json({
                success: false,
                message: validationError
            });
        }


        const variantStatus =
            variant.stock > 0 ?
            "ACTIVE" :
            "OUT_OF_STOCK";


        const [result] =
        await conn.query(
            `
                INSERT INTO product_variants
                (
                    product_id,

                    color,
                    size,

                    weight_value,
                    weight_unit,

                    volume_value,
                    volume_unit,

                    variant_price,

                    stock,
                    sku,
                    status
                )

                VALUES(
                    ?,?,?,?,?,?,?,?,?,?,?
                )
                `, [
                productId,

                variant.color,
                variant.size,

                variant.weightValue,
                variant.weightUnit,

                variant.volumeValue,
                variant.volumeUnit,

                variant.variantPrice,

                variant.stock,
                variant.sku,

                variantStatus
            ]
        );


        await syncProductStock(
            conn,
            productId
        );


        await conn.commit();


        res.status(201).json({
            success: true,
            message: "Product variant created successfully.",
            variantId: result.insertId
        });

    } catch (error) {

        try {
            await conn.rollback();
        } catch {}


        const message =
            String(
                error.sqlMessage ||
                error.message ||
                ""
            );


        if (
            error.code ===
            "ER_DUP_ENTRY" &&
            message.includes(
                "uk_product_variant_sku"
            )
        ) {

            return res.status(409).json({
                success: false,
                message: "This variant SKU already exists for this product."
            });
        }


        next(error);

    } finally {

        conn.release();
    }
};


/* =========================================================
   UPDATE PRODUCT VARIANT
========================================================= */

exports.updateVariant = async(
    req,
    res,
    next
) => {

    const conn =
        await db.getConnection();


    try {

        await conn.beginTransaction();


        const cid =
            await centerId(
                req.user.id,
                conn
            );


        if (!cid) {

            await conn.rollback();

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const productId =
            Number(
                req.params.id
            );


        const variantId =
            Number(
                req.params.variantId
            );


        const [rows] =
        await conn.query(
            `
                SELECT
                    pv.*

                FROM product_variants pv

                JOIN products p
                    ON p.id=pv.product_id

                WHERE pv.id=?
                  AND pv.product_id=?
                  AND p.center_id=?
                  AND p.status<>'DELETED'

                LIMIT 1

                FOR UPDATE
                `, [
                variantId,
                productId,
                cid
            ]
        );


        if (!rows.length) {

            await conn.rollback();

            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }


        const current =
            rows[0];


        const merged = {

            color: req.body.color !== undefined ?
                req.body.color : current.color,

            size: req.body.size !== undefined ?
                req.body.size : current.size,

            weightValue: req.body.weightValue !== undefined ||
                req.body.weight_value !== undefined

                ?
                (
                    req.body.weightValue ||
                    req.body.weight_value
                )

                : current.weight_value,

            weightUnit: req.body.weightUnit !== undefined ||
                req.body.weight_unit !== undefined

                ?
                (
                    req.body.weightUnit ||
                    req.body.weight_unit
                )

                : current.weight_unit,

            volumeValue: req.body.volumeValue !== undefined ||
                req.body.volume_value !== undefined

                ?
                (
                    req.body.volumeValue ||
                    req.body.volume_value
                )

                : current.volume_value,

            volumeUnit: req.body.volumeUnit !== undefined ||
                req.body.volume_unit !== undefined

                ?
                (
                    req.body.volumeUnit ||
                    req.body.volume_unit
                )

                : current.volume_unit,

            variantPrice: req.body.variantPrice !== undefined ||
                req.body.variant_price !== undefined

                ?
                (
                    req.body.variantPrice ||
                    req.body.variant_price
                )

                : current.variant_price,

            stock: req.body.stock !== undefined ?
                req.body.stock : current.stock,

            sku: req.body.sku !== undefined ?
                req.body.sku : current.sku
        };


        const variant =
            normalizeVariant(
                merged
            );


        const validationError =
            validateVariant(
                variant
            );


        if (validationError) {

            await conn.rollback();

            return res.status(400).json({
                success: false,
                message: validationError
            });
        }


        let variantStatus;


        if (
            req.body.status ===
            "DISABLED"
        ) {

            variantStatus =
                "DISABLED";

        } else {

            variantStatus =
                variant.stock > 0 ?
                "ACTIVE" :
                "OUT_OF_STOCK";
        }


        await conn.query(
            `
            UPDATE product_variants

            SET
                color=?,
                size=?,

                weight_value=?,
                weight_unit=?,

                volume_value=?,
                volume_unit=?,

                variant_price=?,

                stock=?,
                sku=?,
                status=?

            WHERE id=?
              AND product_id=?
            `, [
                variant.color,
                variant.size,

                variant.weightValue,
                variant.weightUnit,

                variant.volumeValue,
                variant.volumeUnit,

                variant.variantPrice,

                variant.stock,
                variant.sku,
                variantStatus,

                variantId,
                productId
            ]
        );


        await syncProductStock(
            conn,
            productId
        );


        await conn.commit();


        res.json({
            success: true,
            message: "Product variant updated successfully."
        });

    } catch (error) {

        try {
            await conn.rollback();
        } catch {}


        const message =
            String(
                error.sqlMessage ||
                error.message ||
                ""
            );


        if (
            error.code ===
            "ER_DUP_ENTRY" &&
            message.includes(
                "uk_product_variant_sku"
            )
        ) {

            return res.status(409).json({
                success: false,
                message: "This variant SKU already exists for this product."
            });
        }


        next(error);

    } finally {

        conn.release();
    }
};


/* =========================================================
   DELETE / DISABLE PRODUCT VARIANT
========================================================= */

exports.removeVariant = async(
    req,
    res,
    next
) => {

    const conn =
        await db.getConnection();


    try {

        await conn.beginTransaction();


        const cid =
            await centerId(
                req.user.id,
                conn
            );


        if (!cid) {

            await conn.rollback();

            return res.status(403).json({
                success: false,
                message: "Approved center required"
            });
        }


        const productId =
            Number(
                req.params.id
            );


        const variantId =
            Number(
                req.params.variantId
            );


        const [result] =
        await conn.query(
            `
                UPDATE product_variants pv

                JOIN products p
                    ON p.id=pv.product_id

                SET
                    pv.status='DISABLED',
                    pv.stock=0

                WHERE pv.id=?
                  AND pv.product_id=?
                  AND p.center_id=?
                  AND p.status<>'DELETED'
                `, [
                variantId,
                productId,
                cid
            ]
        );


        if (!result.affectedRows) {

            await conn.rollback();

            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }


        await syncProductStock(
            conn,
            productId
        );


        await conn.commit();


        res.json({
            success: true,
            message: "Product variant removed successfully."
        });

    } catch (error) {

        try {
            await conn.rollback();
        } catch {}


        next(error);

    } finally {

        conn.release();
    }
};