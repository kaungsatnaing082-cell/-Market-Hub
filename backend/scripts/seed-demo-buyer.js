require("dotenv").config();
const bcrypt = require("bcryptjs"),
    db = require("../src/config/db");
(async() => {
    try {
        const email = "buyer@krestcenter.com",
            password = "Buyer@12345",
            hash = await bcrypt.hash(password, 12);
        const [rows] = await db.query("SELECT id FROM users WHERE email=?", [
            email,
        ]);
        let id;
        if (rows.length) {
            id = rows[0].id;
            await db.query(
                "UPDATE users SET name='Demo Buyer',password_hash=?,role='BUYER',status='ACTIVE',phone='09777777777' WHERE id=?", [hash, id],
            );
        } else {
            const [r] = await db.query(
                "INSERT INTO users(name,email,password_hash,phone,role,status) VALUES('Demo Buyer',?,?,?,'BUYER','ACTIVE')", [email, hash, "09777777777"],
            );
            id = r.insertId;
        }
        await db.query(
            "INSERT INTO buyer_profiles(user_id,bio,default_address) VALUES(?,'Demo buyer for Part 3 testing.','Yangon') ON DUPLICATE KEY UPDATE bio=VALUES(bio),default_address=VALUES(default_address)", [id],
        );
        await db.query("INSERT IGNORE INTO carts(buyer_id) VALUES(?)", [id]);
        const [products] = await db.query(
            "SELECT id,center_id,price FROM products WHERE status='ACTIVE' ORDER BY id LIMIT 2",
        );
        if (products.length) {
            await db.query(
                "INSERT IGNORE INTO wishlist_items(buyer_id,product_id) VALUES(?,?)", [id, products[0].id],
            );
            const [existing] = await db.query(
                "SELECT id FROM orders WHERE buyer_id=? AND status='DELIVERED' LIMIT 1", [id],
            );
            if (!existing.length) {
                const p = products[0];
                const [o] = await db.query(
                    "INSERT INTO orders(buyer_id,center_id,total_amount,status,delivery_address,payment_status) VALUES(?,?,?,'DELIVERED','Yangon','PAID')", [id, p.center_id, p.price],
                );
                await db.query(
                    "INSERT INTO order_items(order_id,product_id,quantity,unit_price) VALUES(?,?,1,?)", [o.insertId, p.id, p.price],
                );
                await db.query(
                    "INSERT INTO order_checkout_details(order_id,delivery_phone,payment_method) VALUES(?,'09777777777','COD')", [o.insertId],
                );
            }
        }
        if (products.length) {
            await db.query(
                `INSERT INTO reports(buyer_id,target_type,target_id,reason,details,status) SELECT ?,'PRODUCT',?,'Misleading information','Demo report for Admin workflow testing.','OPEN' WHERE NOT EXISTS(SELECT 1 FROM reports WHERE buyer_id=? AND target_type='PRODUCT' AND target_id=? AND reason='Misleading information')`, [id, products[0].id, id, products[0].id],
            );
        }
        await db.query(
            `INSERT INTO notifications(user_id,title,message,type) SELECT ?,'Welcome to Krest Center','Your Buyer Marketplace is ready.','WELCOME' WHERE NOT EXISTS(SELECT 1 FROM notifications WHERE user_id=? AND title='Welcome to Krest Center')`, [id, id],
        );
        console.log("✅ Demo buyer ready");
        console.log("Email: buyer@krestcenter.com");
        console.log("Password: Buyer@12345");
    } catch (e) {
        console.error("❌", e.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
})();