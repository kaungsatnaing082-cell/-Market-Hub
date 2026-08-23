const db = require("../../config/db");


/* =========================================================
   MARKETPLACE STATS
========================================================= */

exports.stats = async(req, res, next) => {
    try {
        const [
            [centers]
        ] = await db.query(
            `
      SELECT COUNT(*) AS count
      FROM centers
      WHERE status IN ('ACTIVE','WARNING')
      `
        );

        const [
            [buyers]
        ] = await db.query(
            `
      SELECT COUNT(*) AS count
      FROM users
      WHERE role='BUYER'
        AND status='ACTIVE'
      `
        );

        const [
            [products]
        ] = await db.query(
            `
      SELECT COUNT(*) AS count
      FROM products
      WHERE status='ACTIVE'
        AND stock>0
      `
        );

        const [
            [orders]
        ] = await db.query(
            `
      SELECT COUNT(*) AS count
      FROM orders
      `
        );

        res.json({
            success: true,

            stats: {
                centers: centers.count,
                buyers: buyers.count,
                products: products.count,
                orders: orders.count
            }
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   PRODUCT LIST
========================================================= */

exports.products = async(req, res, next) => {
    try {
        const {
            q = "",
                category = "",
                minPrice,
                maxPrice,
                sort = "popular",
                limit
        } = req.query;


        const where = [
            "p.status='ACTIVE'",
            "p.stock>0",
            "c.status IN ('ACTIVE','WARNING')"
        ];

        const values = [];


        /* =====================================================
           SEARCH
        ====================================================== */

        if (q) {
            where.push(
                `
        (
          p.name LIKE ?
          OR p.description LIKE ?
          OR p.category LIKE ?
          OR c.name LIKE ?
        )
        `
            );

            const search =
                `%${q}%`;

            values.push(
                search,
                search,
                search,
                search
            );
        }


        /* =====================================================
           CATEGORY
        ====================================================== */

        if (category) {
            where.push(
                "p.category=?"
            );

            values.push(
                category
            );
        }


        /* =====================================================
           PRICE
        ====================================================== */

        if (
            minPrice !== undefined &&
            minPrice !== ""
        ) {
            where.push(
                "p.price>=?"
            );

            values.push(
                Number(minPrice)
            );
        }


        if (
            maxPrice !== undefined &&
            maxPrice !== ""
        ) {
            where.push(
                "p.price<=?"
            );

            values.push(
                Number(maxPrice)
            );
        }


        /* =====================================================
           SORT
        ====================================================== */

        const orderMap = {
            popular: "p.view_count DESC, p.created_at DESC",

            newest: "p.created_at DESC",

            price_asc: "p.price ASC",

            price_desc: "p.price DESC",

            rating: "rating DESC, p.view_count DESC"
        };


        const order =
            orderMap[sort] ||
            orderMap.popular;


        /* =====================================================
           PRODUCT QUERY
        ====================================================== */

        let sql = `
      SELECT
        p.*,

        c.name AS center_name,
        c.rating AS center_rating,

        COALESCE(
          AVG(pr.rating),
          0
        ) AS rating,

        COUNT(
          DISTINCT pr.id
        ) AS review_count,

        EXISTS(
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id=p.id
            AND pv.status<>'DISABLED'
        ) AS has_variants,

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

      JOIN centers c
        ON c.id=p.center_id

      LEFT JOIN product_reviews pr
        ON pr.product_id=p.id

      WHERE ${where.join(" AND ")}

      GROUP BY p.id

      ORDER BY ${order}
    `;


        if (limit) {
            sql += " LIMIT ?";

            values.push(
                Math.min(
                    50,
                    Math.max(
                        1,
                        Number(limit)
                    )
                )
            );
        }


        const [rows] =
        await db.query(
            sql,
            values
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
   PRODUCT DETAIL + VARIANTS
========================================================= */

exports.product = async(req, res, next) => {
    try {
        const productId =
            Number(req.params.id);


        if (!Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }


        /* =====================================================
           INCREASE VIEW COUNT
        ====================================================== */

        await db.query(
            `
      UPDATE products
      SET view_count=view_count+1
      WHERE id=?
      `, [productId]
        );


        /* =====================================================
           PRODUCT
        ====================================================== */

        const [rows] =
        await db.query(
            `
        SELECT
          p.*,

          c.name AS center_name,
          c.rating AS center_rating,

          COALESCE(
            AVG(pr.rating),
            0
          ) AS rating,

          COUNT(
            DISTINCT pr.id
          ) AS review_count

        FROM products p

        JOIN centers c
          ON c.id=p.center_id

        LEFT JOIN product_reviews pr
          ON pr.product_id=p.id

        WHERE p.id=?
          AND p.status<>'DELETED'
          AND c.status IN ('ACTIVE','WARNING')

        GROUP BY p.id
        `, [productId]
        );


        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        const product =
            rows[0];


        /* =====================================================
           PRODUCT VARIANTS

           Fashion:
           color + size

           Food:
           weight_value + weight_unit

           Beverage:
           volume_value + volume_unit

           Electronics:
           color etc.
        ====================================================== */

        const [variants] =
        await db.query(
            `
        SELECT
          pv.id,

          pv.product_id,

          pv.color,

          pv.size,

          pv.weight_value,
          pv.weight_unit,

          pv.volume_value,
          pv.volume_unit,

          pv.variant_price,

          COALESCE(
            pv.variant_price,
            ?
          ) AS effective_price,

          pv.stock,

          pv.sku,

          pv.status,

          pv.created_at,
          pv.updated_at

        FROM product_variants pv

        WHERE pv.product_id=?
          AND pv.status<>'DISABLED'

        ORDER BY
          pv.color ASC,
          pv.size ASC,
          pv.weight_value ASC,
          pv.volume_value ASC,
          pv.id ASC
        `, [
                product.price,
                productId
            ]
        );


        /* =====================================================
           VARIANT SUMMARY
        ====================================================== */

        const hasVariants =
            variants.length > 0;


        const availableVariants =
            variants.filter(
                variant =>
                variant.status === "ACTIVE" &&
                Number(variant.stock) > 0
            );


        const colors = [
            ...new Set(
                variants
                .map(
                    variant =>
                    variant.color
                )
                .filter(Boolean)
            )
        ];


        const sizes = [
            ...new Set(
                variants
                .map(
                    variant =>
                    variant.size
                )
                .filter(Boolean)
            )
        ];


        const weights = [
            ...new Map(
                variants
                .filter(
                    variant =>
                    variant.weight_value &&
                    variant.weight_unit
                )
                .map(
                    variant => [
                        `${variant.weight_value}-${variant.weight_unit}`,

                        {
                            value: variant.weight_value,

                            unit: variant.weight_unit
                        }
                    ]
                )
            ).values()
        ];


        const volumes = [
            ...new Map(
                variants
                .filter(
                    variant =>
                    variant.volume_value &&
                    variant.volume_unit
                )
                .map(
                    variant => [
                        `${variant.volume_value}-${variant.volume_unit}`,

                        {
                            value: variant.volume_value,

                            unit: variant.volume_unit
                        }
                    ]
                )
            ).values()
        ];


        /* =====================================================
           PRICE RANGE
        ====================================================== */

        let minimumPrice =
            Number(product.price);

        let maximumPrice =
            Number(product.price);


        if (variants.length) {
            const prices =
                variants.map(
                    variant =>
                    Number(
                        variant.effective_price
                    )
                );


            minimumPrice =
                Math.min(...prices);

            maximumPrice =
                Math.max(...prices);
        }


        /* =====================================================
           REVIEWS
        ====================================================== */

        const [reviews] =
        await db.query(
            `
        SELECT
          pr.rating,
          pr.comment,
          pr.created_at,
          u.name AS buyer_name

        FROM product_reviews pr

        JOIN users u
          ON u.id=pr.buyer_id

        WHERE pr.product_id=?

        ORDER BY
          pr.created_at DESC

        LIMIT 30
        `, [productId]
        );


        /* =====================================================
           RESPONSE
        ====================================================== */

        res.json({
            success: true,

            product: {
                ...product,

                has_variants: hasVariants,

                minimum_price: minimumPrice,

                maximum_price: maximumPrice
            },

            variantSummary: {
                hasVariants,

                availableCount: availableVariants.length,

                colors,

                sizes,

                weights,

                volumes
            },

            variants,

            reviews
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   CATEGORIES
========================================================= */

exports.categories = async(
    req,
    res,
    next
) => {
    try {
        const [rows] =
        await db.query(
            `
        SELECT
          p.category,
          COUNT(*) AS product_count

        FROM products p

        JOIN centers c
          ON c.id=p.center_id

        WHERE p.status='ACTIVE'
          AND p.stock>0
          AND c.status IN ('ACTIVE','WARNING')

        GROUP BY p.category

        ORDER BY
          product_count DESC,
          p.category
        `
        );


        res.json({
            success: true,
            categories: rows
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   CENTERS
========================================================= */

exports.centers = async(
    req,
    res,
    next
) => {
    try {
        const q =
            req.query.q || "";

        const limit =
            Math.min(
                50,
                Math.max(
                    0,
                    Number(
                        req.query.limit || 0
                    )
                )
            );


        const values = [
            q,
            `%${q}%`,
            `%${q}%`,
            `%${q}%`
        ];


        let sql = `
      SELECT
        c.*,

        COUNT(
          DISTINCT p.id
        ) AS product_count,

        COUNT(
          DISTINCT cr.id
        ) AS review_count,

        COALESCE(
          AVG(cr.rating),
          c.rating,
          0
        ) AS calculated_rating

      FROM centers c

      LEFT JOIN products p
        ON p.center_id=c.id
        AND p.status='ACTIVE'

      LEFT JOIN center_reviews cr
        ON cr.center_id=c.id

      WHERE c.status IN ('ACTIVE','WARNING')

        AND (
          ?=''
          OR c.name LIKE ?
          OR c.category LIKE ?
          OR c.location LIKE ?
        )

      GROUP BY c.id

      ORDER BY
        calculated_rating DESC,
        product_count DESC
    `;


        if (limit) {
            sql += " LIMIT ?";

            values.push(limit);
        }


        const [rows] =
        await db.query(
            sql,
            values
        );


        rows.forEach(
            center => {
                center.rating =
                    center.calculated_rating;
            }
        );


        res.json({
            success: true,
            centers: rows
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   CENTER DETAIL
========================================================= */

exports.center = async(
    req,
    res,
    next
) => {
    try {
        const [rows] =
        await db.query(
            `
        SELECT
          c.*,

          COUNT(
            DISTINCT cr.id
          ) AS review_count,

          COALESCE(
            AVG(cr.rating),
            c.rating,
            0
          ) AS calculated_rating

        FROM centers c

        LEFT JOIN center_reviews cr
          ON cr.center_id=c.id

        WHERE c.id=?
          AND c.status IN ('ACTIVE','WARNING')

        GROUP BY c.id
        `, [req.params.id]
        );


        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Center not found"
            });
        }


        rows[0].rating =
            rows[0].calculated_rating;


        const [products] =
        await db.query(
            `
        SELECT
          p.*,

          c.name AS center_name,

          COALESCE(
            AVG(pr.rating),
            0
          ) AS rating

        FROM products p

        JOIN centers c
          ON c.id=p.center_id

        LEFT JOIN product_reviews pr
          ON pr.product_id=p.id

        WHERE p.center_id=?
          AND p.status='ACTIVE'
          AND p.stock>0

        GROUP BY p.id

        ORDER BY
          p.view_count DESC
        `, [req.params.id]
        );


        const [reviews] =
        await db.query(
            `
        SELECT
          cr.rating,
          cr.comment,
          cr.created_at,
          u.name AS buyer_name

        FROM center_reviews cr

        JOIN users u
          ON u.id=cr.buyer_id

        WHERE cr.center_id=?

        ORDER BY
          cr.created_at DESC

        LIMIT 30
        `, [req.params.id]
        );


        res.json({
            success: true,

            center: rows[0],

            products,

            reviews
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   SEARCH
========================================================= */

exports.search = async(
    req,
    res,
    next
) => {
    try {
        const q =
            req.query.q || "";

        const like =
            `%${q}%`;


        const [products] =
        await db.query(
            `
        SELECT
          p.*,

          c.name AS center_name,

          COALESCE(
            AVG(pr.rating),
            0
          ) AS rating

        FROM products p

        JOIN centers c
          ON c.id=p.center_id

        LEFT JOIN product_reviews pr
          ON pr.product_id=p.id

        WHERE p.status='ACTIVE'
          AND p.stock>0
          AND c.status IN ('ACTIVE','WARNING')

          AND (
            p.name LIKE ?
            OR p.category LIKE ?
            OR p.description LIKE ?
            OR c.name LIKE ?
          )

        GROUP BY p.id

        ORDER BY
          p.view_count DESC

        LIMIT 16
        `, [
                like,
                like,
                like,
                like
            ]
        );


        const [centers] =
        await db.query(
            `
        SELECT
          c.*,

          COALESCE(
            AVG(cr.rating),
            c.rating,
            0
          ) AS calculated_rating

        FROM centers c

        LEFT JOIN center_reviews cr
          ON cr.center_id=c.id

        WHERE c.status IN ('ACTIVE','WARNING')

          AND (
            c.name LIKE ?
            OR c.category LIKE ?
            OR c.location LIKE ?
          )

        GROUP BY c.id

        ORDER BY
          calculated_rating DESC

        LIMIT 10
        `, [
                like,
                like,
                like
            ]
        );


        centers.forEach(
            center => {
                center.rating =
                    center.calculated_rating;
            }
        );


        res.json({
            success: true,
            products,
            centers
        });

    } catch (error) {
        next(error);
    }
};