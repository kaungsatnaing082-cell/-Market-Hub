require("dotenv").config();
const bcrypt = require("bcryptjs"),
    db = require("../src/config/db");
(async() => {
    try {
        const email = "seller@krestcenter.com",
            password = "Seller@12345",
            hash = await bcrypt.hash(password, 12);
        let [u] = await db.query("SELECT id FROM users WHERE email=? LIMIT 1", [
                email,
            ]),
            sid;
        if (u.length) {
            sid = u[0].id;
            await db.query(
                "UPDATE users SET name='Demo Seller',password_hash=?,role='SELLER',status='ACTIVE' WHERE id=?", [hash, sid],
            );
        } else {
            const [r] = await db.query(
                "INSERT INTO users(name,email,password_hash,phone,role,status) VALUES('Demo Seller',?,?,?,'SELLER','ACTIVE')", [email, hash, "09999999999"],
            );
            sid = r.insertId;
        }
        let [rq] = await db.query(
                "SELECT id FROM center_requests WHERE seller_id=? ORDER BY id DESC LIMIT 1", [sid],
            ),
            rid;
        if (rq.length) {
            rid = rq[0].id;
            await db.query(
                "UPDATE center_requests SET center_name='Demo Tech Center',category='Electronics',description='Approved demo center for Part 2.',location='Yangon',status='APPROVED' WHERE id=?", [rid],
            );
        } else {
            const [r] = await db.query(
                "INSERT INTO center_requests(seller_id,center_name,category,description,location,status) VALUES(?,'Demo Tech Center','Electronics','Approved demo center for Part 2.','Yangon','APPROVED')", [sid],
            );
            rid = r.insertId;
        }
        let [cs] = await db.query(
                "SELECT id FROM centers WHERE seller_id=? LIMIT 1", [sid],
            ),
            cid;
        if (cs.length) {
            cid = cs[0].id;
            await db.query(
                "UPDATE centers SET name='Demo Tech Center',category='Electronics',description='Approved demo center for Part 2.',location='Yangon',status='ACTIVE' WHERE id=?", [cid],
            );
        } else {
            const [r] = await db.query(
                "INSERT INTO centers(seller_id,source_request_id,name,category,description,location,status) VALUES(?,?,'Demo Tech Center','Electronics','Approved demo center for Part 2.','Yangon','ACTIVE')", [sid, rid],
            );
            cid = r.insertId;
        }
        const [ps] = await db.query(
            "SELECT id FROM products WHERE center_id=? LIMIT 1", [cid],
        );
        if (!ps.length)
            await db.query(
                "INSERT INTO products(center_id,name,category,sku,price,stock,description,status,view_count) VALUES (?,'Wireless Keyboard','Electronics','KB-001',39,18,'Compact wireless keyboard','ACTIVE',120),(?,'Smart Watch','Electronics','SW-002',88,7,'Everyday smart watch','ACTIVE',210),(?,'USB-C Hub','Electronics','HUB-003',26,3,'Multi-port USB-C hub','ACTIVE',95)", [cid, cid, cid],
            );
        let [buyer] = await db.query(
                "SELECT id FROM users WHERE email='buyer-demo@krestcenter.com' LIMIT 1",
            ),
            bid;
        if (buyer.length) bid = buyer[0].id;
        else {
            const bh = await bcrypt.hash("Buyer@12345", 12);
            const [r] = await db.query(
                "INSERT INTO users(name,email,password_hash,role,status) VALUES('Demo Buyer','buyer-demo@krestcenter.com',?,'BUYER','ACTIVE')", [bh],
            );
            bid = r.insertId;
        }
        const [ord] = await db.query(
            "SELECT id FROM orders WHERE buyer_id=? AND center_id=? LIMIT 1", [bid, cid],
        );
        if (!ord.length) {
            const [
                [p1]
            ] = await db.query(
                "SELECT id,price FROM products WHERE center_id=? ORDER BY id LIMIT 1", [cid],
            );
            const [o] = await db.query(
                "INSERT INTO orders(buyer_id,center_id,total_amount,status,payment_status) VALUES(?,?,?,'DELIVERED','PAID')", [bid, cid, p1.price],
            );
            await db.query(
                "INSERT INTO order_items(order_id,product_id,quantity,unit_price) VALUES(?,?,1,?)", [o.insertId, p1.id, p1.price],
            );
            await db.query(
                "INSERT IGNORE INTO product_reviews(buyer_id,product_id,rating,comment) VALUES(?,?,5,'Very good product and clear listing.')", [bid, p1.id],
            );
            await db.query(
                "INSERT IGNORE INTO center_reviews(buyer_id,center_id,rating,comment) VALUES(?,?,5,'Fast service and helpful center.')", [bid, cid],
            );
        }
        await db.query(
            "INSERT INTO notifications(user_id,title,message,type) SELECT ?,'Center approved','Your Demo Tech Center is active and ready for products.','CENTER_APPROVED' WHERE NOT EXISTS(SELECT 1 FROM notifications WHERE user_id=? AND title='Center approved')", [sid, sid],
        );
        console.log("✅ Demo seller ready");
        console.log("Email: seller@krestcenter.com");
        console.log("Password: Seller@12345");
    } catch (e) {
        console.error("❌", e.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
})();