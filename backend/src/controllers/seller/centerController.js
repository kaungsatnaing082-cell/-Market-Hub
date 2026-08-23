const db = require("../../config/db");

exports.submitRequest = async (req, res, next) => {
  try {
    const { centerName, category, description, location, businessInfo } = req.body;
    if (!centerName || !category) {
      return res.status(400).json({ success: false, message: "Center name and category are required." });
    }

    const [centers] = await db.query(
      "SELECT id FROM centers WHERE seller_id=? AND status IN ('ACTIVE','WARNING','SUSPENDED') LIMIT 1",
      [req.user.id]
    );
    if (centers.length) {
      return res.status(409).json({ success: false, message: "You already have a center." });
    }

    const [pending] = await db.query(
      "SELECT id FROM center_requests WHERE seller_id=? AND status='PENDING' LIMIT 1",
      [req.user.id]
    );
    if (pending.length) {
      return res.status(409).json({ success: false, message: "You already have a pending center request." });
    }

    const [result] = await db.query(
      `INSERT INTO center_requests
       (seller_id,center_name,category,description,location,business_info,status)
       VALUES(?,?,?,?,?,?,'PENDING')`,
      [req.user.id, centerName.trim(), category.trim(), description || null, location || null, businessInfo || null]
    );

    await db.query(
      `INSERT INTO notifications(user_id,title,message,type)
       SELECT id,'New center request',?,'CENTER_REQUEST'
       FROM users WHERE role='ADMIN' AND status='ACTIVE'`,
      [`Seller submitted ${centerName.trim()} for review.`]
    );

    res.status(201).json({ success: true, requestId: result.insertId });
  } catch (e) {
    next(e);
  }
};

exports.getRequest = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM center_requests WHERE seller_id=? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    res.json({ success: true, request: rows[0] || null });
  } catch (e) {
    next(e);
  }
};

exports.getCenter = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM centers WHERE seller_id=? ORDER BY id DESC LIMIT 1",
      [req.user.id]
    );
    res.json({ success: true, center: rows[0] || null });
  } catch (e) {
    next(e);
  }
};

exports.updateCenter = async (req, res, next) => {
  try {
    const { name, category, description, location, profileImage, coverImage } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Center name and category are required." });
    }
    const [rows] = await db.query(
      "SELECT id FROM centers WHERE seller_id=? AND status IN ('ACTIVE','WARNING') ORDER BY id DESC LIMIT 1",
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(403).json({ success: false, message: "An active or warning-status center is required." });
    }
    await db.query(
      "UPDATE centers SET name=?,category=?,description=?,location=?,profile_image=?,cover_image=? WHERE id=?",
      [name.trim(), category.trim(), description || null, location || null, profileImage || null, coverImage || null, rows[0].id]
    );
    res.json({ success: true, message: "Center updated" });
  } catch (e) {
    next(e);
  }
};
