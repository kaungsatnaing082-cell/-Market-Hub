const db = require("../../config/db");

/* =========================================================
   GET / CREATE BUYER CART
========================================================= */

async function cartId(userId) {
    await db.query(
        "INSERT IGNORE INTO carts(buyer_id) VALUES(?)", [userId]
    );

    const [rows] = await db.query(
        "SELECT id FROM carts WHERE buyer_id=? LIMIT 1", [userId]
    );

    return rows[0].id;
}


/* =========================================================
   NORMALIZE VARIANT ID
========================================================= */

function normalizeVariantId(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const id = Number(value);

    if (!Number.isInteger(id) ||
        id <= 0
    ) {
        return NaN;
    }

    return id;
}


/* =========================================================
   GET CART
========================================================= */

exports.get = async(req, res, next) => {
    try {
        const id =
            await cartId(req.user.id);

        const [items] = await db.query(
            `
      SELECT
        ci.id,
        ci.quantity,
        ci.variant_id,

        p.id AS product_id,
        p.name,
        p.image_url,
        p.center_id,

        c.name AS center_name,

        CASE
          WHEN ci.variant_id IS NULL
          THEN p.price
          ELSE COALESCE(
            pv.variant_price,
            p.price
          )
        END AS price,

        CASE
          WHEN ci.variant_id IS NULL
          THEN p.stock
          ELSE pv.stock
        END AS stock,

        pv.color,
        pv.size,

        pv.weight_value,
        pv.weight_unit,

        pv.volume_value,
        pv.volume_unit,

        pv.sku AS variant_sku,
        pv.status AS variant_status

      FROM cart_items ci

      JOIN products p
        ON p.id = ci.product_id

      JOIN centers c
        ON c.id = p.center_id

      LEFT JOIN product_variants pv
        ON pv.id = ci.variant_id
        AND pv.product_id = p.id

      WHERE ci.cart_id = ?
        AND p.status <> 'DELETED'

      ORDER BY ci.created_at DESC
      `, [id]
        );


        const total =
            items.reduce(
                (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
                0
            );


        res.json({
            success: true,
            items,
            total
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   ADD TO CART
========================================================= */

exports.add = async(req, res, next) => {
    try {
        const id =
            await cartId(req.user.id);

        const productId =
            Number(req.body.productId);

        const quantity =
            Number(req.body.quantity || 1);

        const variantId =
            normalizeVariantId(
                req.body.variantId
            );


        /* =====================================================
           VALIDATION
        ====================================================== */

        if (!Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }


        if (!Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number."
            });
        }


        if (Number.isNaN(variantId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variant."
            });
        }


        /* =====================================================
           LOAD PRODUCT
        ====================================================== */

        const [products] = await db.query(
            `
      SELECT
        id,
        name,
        price,
        stock,
        status,
        center_id

      FROM products

      WHERE id=?
        AND status='ACTIVE'

      LIMIT 1
      `, [productId]
        );


        if (!products.length) {
            return res.status(404).json({
                success: false,
                message: "Product is not available."
            });
        }


        const product =
            products[0];


        /* =====================================================
           CHECK WHETHER PRODUCT HAS VARIANTS
        ====================================================== */

        const [variantCountRows] =
        await db.query(
            `
        SELECT COUNT(*) AS total
        FROM product_variants
        WHERE product_id=?
          AND status <> 'DISABLED'
        `, [productId]
        );


        const hasVariants =
            Number(
                variantCountRows[0].total
            ) > 0;


        /*
         * Product has variants:
         * Buyer must choose one.
         */
        if (
            hasVariants &&
            variantId === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a product option before adding this item to your cart."
            });
        }


        let availableStock =
            Number(product.stock);

        let selectedVariant =
            null;


        /* =====================================================
           VALIDATE SELECTED VARIANT
        ====================================================== */

        if (variantId !== null) {
            const [variants] =
            await db.query(
                `
          SELECT
            id,
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

          FROM product_variants

          WHERE id=?
            AND product_id=?

          LIMIT 1
          `, [
                    variantId,
                    productId
                ]
            );


            if (!variants.length) {
                return res.status(404).json({
                    success: false,
                    message: "Selected product option was not found."
                });
            }


            selectedVariant =
                variants[0];


            if (
                selectedVariant.status !==
                "ACTIVE"
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Selected product option is currently unavailable."
                });
            }


            availableStock =
                Number(
                    selectedVariant.stock
                );
        }


        if (
            quantity >
            availableStock
        ) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock."
            });
        }


        /* =====================================================
           FIND SAME CART ITEM
        ====================================================== */

        let existingRows;


        if (variantId === null) {
            [existingRows] =
            await db.query(
                `
          SELECT
            id,
            quantity

          FROM cart_items

          WHERE cart_id=?
            AND product_id=?
            AND variant_id IS NULL

          LIMIT 1
          `, [
                    id,
                    productId
                ]
            );

        } else {
            [existingRows] =
            await db.query(
                `
          SELECT
            id,
            quantity

          FROM cart_items

          WHERE cart_id=?
            AND product_id=?
            AND variant_id=?

          LIMIT 1
          `, [
                    id,
                    productId,
                    variantId
                ]
            );
        }


        /* =====================================================
           UPDATE EXISTING ITEM
        ====================================================== */

        if (existingRows.length) {
            const newQuantity =
                Number(
                    existingRows[0].quantity
                ) + quantity;


            if (
                newQuantity >
                availableStock
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Cart quantity would exceed available stock."
                });
            }


            await db.query(
                `
        UPDATE cart_items
        SET quantity=?
        WHERE id=?
          AND cart_id=?
        `, [
                    newQuantity,
                    existingRows[0].id,
                    id
                ]
            );


            return res.json({
                success: true,
                message: "Cart quantity updated."
            });
        }


        /* =====================================================
           INSERT NEW CART ITEM
        ====================================================== */

        await db.query(
            `
      INSERT INTO cart_items
      (
        cart_id,
        product_id,
        variant_id,
        quantity
      )
      VALUES(?,?,?,?)
      `, [
                id,
                productId,
                variantId,
                quantity
            ]
        );


        res.json({
            success: true,
            message: "Added to cart."
        });

    } catch (error) {

        /*
         * This normally means the old
         * uk_cart_product unique index
         * still exists.
         */
        if (
            error.code ===
            "ER_DUP_ENTRY"
        ) {
            return res.status(409).json({
                success: false,
                message: "This product option conflicts with an existing cart item. Please check the cart database index."
            });
        }

        next(error);
    }
};


/* =========================================================
   UPDATE CART QUANTITY
========================================================= */

exports.update = async(
    req,
    res,
    next
) => {
    try {
        const id =
            await cartId(req.user.id);

        const quantity =
            Number(req.body.quantity);


        if (!Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number."
            });
        }


        const [rows] = await db.query(
            `
      SELECT
        ci.id,
        ci.variant_id,
        p.stock AS product_stock,
        pv.stock AS variant_stock,
        pv.status AS variant_status

      FROM cart_items ci

      JOIN products p
        ON p.id = ci.product_id

      LEFT JOIN product_variants pv
        ON pv.id = ci.variant_id

      WHERE ci.id=?
        AND ci.cart_id=?

      LIMIT 1
      `, [
                req.params.id,
                id
            ]
        );


        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }


        const item =
            rows[0];


        let availableStock;


        if (item.variant_id) {
            if (
                item.variant_status !==
                "ACTIVE"
            ) {
                return res.status(409).json({
                    success: false,
                    message: "This product option is no longer available."
                });
            }

            availableStock =
                Number(
                    item.variant_stock
                );

        } else {
            availableStock =
                Number(
                    item.product_stock
                );
        }


        if (
            quantity >
            availableStock
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock."
            });
        }


        await db.query(
            `
      UPDATE cart_items
      SET quantity=?
      WHERE id=?
        AND cart_id=?
      `, [
                quantity,
                req.params.id,
                id
            ]
        );


        res.json({
            success: true,
            message: "Cart quantity updated."
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   REMOVE CART ITEM
========================================================= */

exports.remove = async(
    req,
    res,
    next
) => {
    try {
        const id =
            await cartId(req.user.id);


        await db.query(
            `
      DELETE FROM cart_items
      WHERE id=?
        AND cart_id=?
      `, [
                req.params.id,
                id
            ]
        );


        res.json({
            success: true,
            message: "Cart item removed."
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================================
   CHECKOUT
========================================================= */

exports.checkout = async(
        req,
        res,
        next
    ) => {
        const conn =
            await db.getConnection();


        try {
            const address =
                String(
                    req.body.address || ""
                ).trim();

            const phone =
                String(
                    req.body.phone || ""
                ).trim();

            const paymentMethod =
                req.body.paymentMethod ||
                "COD";


            /* =====================================================
               CHECKOUT VALIDATION
            ====================================================== */

            if (!address ||
                !phone
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Delivery address and phone are required."
                });
            }


            if (![
                    "COD",
                    "KBZPAY_DEMO",
                    "WAVEPAY_DEMO"
                ].includes(
                    paymentMethod
                )) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment method."
                });
            }


            await conn.beginTransaction();


            /* =====================================================
               LOCK CART
            ====================================================== */

            const [carts] =
            await conn.query(
                `
        SELECT id
        FROM carts
        WHERE buyer_id=?
        FOR UPDATE
        `, [req.user.id]
            );


            if (!carts.length) {
                await conn.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Cart is empty."
                });
            }


            const cart =
                carts[0].id;


            /* =====================================================
               LOAD CART ITEMS + VARIANTS
            ====================================================== */

            const [items] =
            await conn.query(
                `
        SELECT
          ci.id AS cart_item_id,
          ci.quantity,
          ci.variant_id,

          p.id AS product_id,
          p.name,
          p.price AS product_price,
          p.stock AS product_stock,
          p.center_id,
          p.status AS product_status,

          pv.color,
          pv.size,

          pv.weight_value,
          pv.weight_unit,

          pv.volume_value,
          pv.volume_unit,

          pv.variant_price,
          pv.stock AS variant_stock,
          pv.sku AS variant_sku,
          pv.status AS variant_status,

          CASE
            WHEN ci.variant_id IS NULL
            THEN p.price
            ELSE COALESCE(
              pv.variant_price,
              p.price
            )
          END AS unit_price

        FROM cart_items ci

        JOIN products p
          ON p.id = ci.product_id

        LEFT JOIN product_variants pv
          ON pv.id = ci.variant_id
          AND pv.product_id = p.id

        WHERE ci.cart_id=?

        FOR UPDATE
        `, [cart]
            );


            if (!items.length) {
                await conn.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Cart is empty."
                });
            }


            /* =====================================================
               FINAL STOCK VALIDATION
            ====================================================== */

            for (const item of items) {

                if (
                    item.product_status !==
                    "ACTIVE"
                ) {
                    await conn.rollback();

                    return res.status(409).json({
                        success: false,
                        message: `${item.name} is no longer available.`
                    });
                }


                /* ===================================================
                   VARIANT PRODUCT
                ==================================================== */

                if (item.variant_id) {

                    if (!item.variant_status) {
                        await conn.rollback();

                        return res.status(409).json({
                            success: false,
                            message: `${item.name} option no longer exists.`
                        });
                    }


                    if (
                        item.variant_status !==
                        "ACTIVE"
                    ) {
                        await conn.rollback();

                        return res.status(409).json({
                            success: false,
                            message: `${item.name} selected option is no longer available.`
                        });
                    }


                    if (
                        Number(
                            item.variant_stock
                        ) <
                        Number(
                            item.quantity
                        )
                    ) {
                        await conn.rollback();

                        return res.status(409).json({
                            success: false,
                            message: `${item.name} selected option does not have enough stock.`
                        });
                    }

                } else {

                    /* =================================================
                       NORMAL PRODUCT
                    ================================================== */

                    if (
                        Number(
                            item.product_stock
                        ) <
                        Number(
                            item.quantity
                        )
                    ) {
                        await conn.rollback();

                        return res.status(409).json({
                            success: false,
                            message: `${item.name} no longer has enough stock.`
                        });
                    }
                }
            }


            /* =====================================================
               GROUP ITEMS BY CENTER
            ====================================================== */

            const groups = {};


            for (const item of items) {
                if (!groups[item.center_id]) {
                    groups[item.center_id] = [];
                }

                groups[item.center_id].push(
                    item
                );
            }


            const orderIds = [];


            /* =====================================================
               CREATE ONE ORDER PER CENTER
            ====================================================== */

            for (
                const [
                    centerId,
                    list
                ] of Object.entries(groups)
            ) {

                /* ===================================================
                   ORDER TOTAL
                ==================================================== */

                const total =
                    list.reduce(
                        (sum, item) =>
                        sum +
                        Number(
                            item.unit_price
                        ) *
                        Number(
                            item.quantity
                        ),
                        0
                    );


                /* ===================================================
                   CREATE ORDER
                ==================================================== */

                const [orderResult] =
                await conn.query(
                    `
          INSERT INTO orders
          (
            buyer_id,
            center_id,
            total_amount,
            status,
            delivery_address,
            payment_status
          )
          VALUES(
            ?,?,?,
            'PENDING',
            ?,
            'PENDING'
          )
          `, [
                        req.user.id,
                        centerId,
                        total,
                        address
                    ]
                );


                const orderId =
                    orderResult.insertId;


                orderIds.push(
                    orderId
                );


                /* ===================================================
                   CHECKOUT DETAILS
                ==================================================== */

                await conn.query(
                    `
        INSERT INTO order_checkout_details
        (
          order_id,
          delivery_phone,
          payment_method
        )
        VALUES(?,?,?)
        `, [
                        orderId,
                        phone,
                        paymentMethod
                    ]
                );


                /* ===================================================
                   ORDER ITEMS
                ==================================================== */

                for (const item of list) {

                    /* =================================================
                       SAVE VARIANT SNAPSHOT
                    ================================================== */

                    await conn.query(
                        `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            variant_id,

            selected_color,
            selected_size,

            selected_weight_value,
            selected_weight_unit,

            selected_volume_value,
            selected_volume_unit,

            variant_sku,

            quantity,
            unit_price
          )
          VALUES(
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?
          )
          `, [
                            orderId,
                            item.product_id,
                            item.variant_id || null,

                            item.color || null,
                            item.size || null,

                            item.weight_value || null,
                            item.weight_unit || null,

                            item.volume_value || null,
                            item.volume_unit || null,

                            item.variant_sku || null,

                            item.quantity,
                            item.unit_price
                        ]
                    );


                    /* =================================================
                       VARIANT STOCK UPDATE
                    ================================================== */

                    if (item.variant_id) {

                        const [variantUpdate] =
                        await conn.query(
                            `
              UPDATE product_variants

              SET
                stock = stock - ?,

                status = IF(
                  stock - ? <= 0,
                  'OUT_OF_STOCK',
                  'ACTIVE'
                )

              WHERE id=?
                AND stock >= ?
              `, [
                                item.quantity,
                                item.quantity,
                                item.variant_id,
                                item.quantity
                            ]
                        );


                        if (!variantUpdate.affectedRows) {
                            throw new Error(
                                `${item.name} variant stock changed during checkout.`
                            );
                        }


                        /* ===============================================
                           SYNC PRODUCT TOTAL STOCK
                        ================================================ */

                        const [stockRows] =
                        await conn.query(
                            `
              SELECT
                COALESCE(
                  SUM(stock),
                  0
                ) AS total_stock

              FROM product_variants

              WHERE product_id=?
                AND status <> 'DISABLED'
              `, [item.product_id]
                        );


                        const totalVariantStock =
                            Number(
                                stockRows[0].total_stock
                            );


                        await conn.query(
                            `
            UPDATE products

            SET
              stock=?,

              status=
                CASE
                  WHEN ? <= 0
                  THEN 'OUT_OF_STOCK'

                  WHEN status='OUT_OF_STOCK'
                  THEN 'ACTIVE'

                  ELSE status
                END

            WHERE id=?
            `, [
                                totalVariantStock,
                                totalVariantStock,
                                item.product_id
                            ]
                        );

                    } else {

                        /* =================================================
                           NORMAL PRODUCT STOCK UPDATE
                        ================================================== */

                        const [productUpdate] =
                        await conn.query(
                            `
              UPDATE products

              SET
                stock = stock - ?,

                status = IF(
                  stock - ? <= 0,
                  'OUT_OF_STOCK',
                  status
                )

              WHERE id=?
                AND stock >= ?
              `, [
                                item.quantity,
                                item.quantity,
                                item.product_id,
                                item.quantity
                            ]
                        );


                        if (!productUpdate.affectedRows) {
                            throw new Error(
                                `${item.name} stock changed during checkout.`
                            );
                        }
                    }
                }


                /* ===================================================
                   SELLER NOTIFICATION
                ==================================================== */

                const [seller] =
                await conn.query(
                    `
          SELECT seller_id
          FROM centers
          WHERE id=?
          LIMIT 1
          `, [centerId]
                );


                if (seller.length) {
                    await conn.query(
                        `
          INSERT INTO notifications
          (
            user_id,
            title,
            message,
            type
          )
          VALUES(
            ?,
            'New order',
            ?,
            'NEW_ORDER'
          )
          `, [
                            seller[0].seller_id,
                            `A buyer placed order #${orderId}.`
                        ]
                    );
                }
            }


            /* =====================================================
               CLEAR CART
            ====================================================== */

            await conn.query(
                `
      DELETE FROM cart_items
      WHERE cart_id=?
      `, [cart]
            );


            /* =====================================================
               BUYER NOTIFICATION
            ====================================================== */

            await conn.query(
                    `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        type
      )
      VALUES(
        ?,
        'Order placed',
        ?,
        'ORDER_PLACED'
      )
      `, [
                        req.user.id,

                        `Your order${
          orderIds.length > 1
            ? "s"
            : ""
        } ${
          orderIds
            .map(
              id => `#${id}`
            )
            .join(", ")
        } ${
          orderIds.length > 1
            ? "were"
            : "was"
        } placed successfully.`
      ]
    );


    /* =====================================================
       COMMIT
    ====================================================== */

    await conn.commit();


    res.status(201).json({
      success: true,
      message:
        "Order placed successfully.",
      orderIds
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