const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../../config/db");
const { signToken } = require("../../utils/jwt");

function publicUser(u){
  return { id:u.id, name:u.name, email:u.email, role:u.role, status:u.status };
}

function strongPassword(password){
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password || "");
}

exports.register = async (req,res,next) => {
  try{
    const name=String(req.body.name||"").trim();
    const email=String(req.body.email||"").trim().toLowerCase();
    const password=req.body.password;
    const phone=String(req.body.phone||"").trim();
    const role=req.body.role;
    if(!name || !email || !password || !["BUYER","SELLER"].includes(role))
      return res.status(400).json({success:false,message:"Name, email, password and Buyer/Seller role are required."});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({success:false,message:"Enter a valid email address."});
    if(!strongPassword(password))
      return res.status(400).json({success:false,message:"Password must be 8+ characters with upper, lower and number."});
    const [existing]=await db.query("SELECT id FROM users WHERE email=? LIMIT 1",[email]);
    if(existing.length) return res.status(409).json({success:false,message:"Email is already registered."});
    const hash=await bcrypt.hash(password,12);
    const [result]=await db.query("INSERT INTO users(name,email,password_hash,phone,role,status) VALUES(?,?,?,?,?,'ACTIVE')",[name,email,hash,phone||null,role]);
    const user={id:result.insertId,name,email,role,status:"ACTIVE"};
    if(role==="BUYER"){
      await db.query("INSERT IGNORE INTO buyer_profiles(user_id) VALUES(?)",[user.id]);
      await db.query("INSERT IGNORE INTO carts(buyer_id) VALUES(?)",[user.id]);
    }
    return res.status(201).json({success:true,token:signToken(user),user});
  }catch(err){next(err)}
};

exports.login = async (req,res,next) => {
  try{
    const email=String(req.body.email||"").trim().toLowerCase();
    const password=req.body.password||"";
    const [rows]=await db.query("SELECT * FROM users WHERE email=? LIMIT 1",[email]);
    if(!rows.length) return res.status(401).json({success:false,message:"Invalid email or password."});
    const user=rows[0];
    if(user.status!=="ACTIVE") return res.status(403).json({success:false,message:"This account is not active."});
    if(!(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({success:false,message:"Invalid email or password."});
    return res.json({success:true,token:signToken(user),user:publicUser(user)});
  }catch(err){next(err)}
};

exports.adminLogin = async (req,res,next) => {
  try{
    const email=String(req.body.email||"").trim().toLowerCase();
    const password=req.body.password||"";
    const [rows]=await db.query("SELECT * FROM users WHERE email=? AND role='ADMIN' LIMIT 1",[email]);
    if(!rows.length) return res.status(401).json({success:false,message:"Admin credentials could not be verified."});
    const user=rows[0];
    if(user.status!=="ACTIVE" || !(await bcrypt.compare(password,user.password_hash)))
      return res.status(401).json({success:false,message:"Admin credentials could not be verified."});
    await db.query("INSERT INTO admin_login_logs(admin_id,login_at,ip_address) VALUES(?,NOW(),?)",[user.id,req.ip]);
    return res.json({success:true,token:signToken(user),user:publicUser(user)});
  }catch(err){next(err)}
};

exports.forgotPassword = async (req,res,next) => {
  try{
    const email=String(req.body.email||"").trim().toLowerCase();
    if(!email) return res.status(400).json({success:false,message:"Email is required."});
    const [users]=await db.query("SELECT id,status FROM users WHERE email=? LIMIT 1",[email]);
    const response={success:true,message:"If the account exists, a reset request has been created."};
    if(!users.length || users[0].status!=="ACTIVE") return res.json(response);

    const token=crypto.randomBytes(32).toString("hex");
    const tokenHash=crypto.createHash("sha256").update(token).digest("hex");
    await db.query("UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=? AND used_at IS NULL",[users[0].id]);
    await db.query("INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 15 MINUTE))",[users[0].id,tokenHash]);

    if(process.env.NODE_ENV!=="production"){
      response.demoResetToken=token;
      response.demoResetUrl=`/pages/auth/reset-password.html?token=${token}`;
      response.message="Demo reset link created. Use the button below within 15 minutes.";
    }
    res.json(response);
  }catch(err){next(err)}
};

exports.resetPassword = async (req,res,next) => {
  const conn=await db.getConnection();
  try{
    const token=String(req.body.token||"").trim();
    const password=req.body.password||"";
    if(!token || !strongPassword(password))
      return res.status(400).json({success:false,message:"A valid reset token and strong password are required."});
    const tokenHash=crypto.createHash("sha256").update(token).digest("hex");
    await conn.beginTransaction();
    const [rows]=await conn.query(`SELECT prt.id,prt.user_id FROM password_reset_tokens prt JOIN users u ON u.id=prt.user_id WHERE prt.token_hash=? AND prt.used_at IS NULL AND prt.expires_at>NOW() AND u.status='ACTIVE' LIMIT 1 FOR UPDATE`,[tokenHash]);
    if(!rows.length){await conn.rollback();return res.status(400).json({success:false,message:"Reset link is invalid or expired."});}
    const hash=await bcrypt.hash(password,12);
    await conn.query("UPDATE users SET password_hash=? WHERE id=?",[hash,rows[0].user_id]);
    await conn.query("UPDATE password_reset_tokens SET used_at=NOW() WHERE id=?",[rows[0].id]);
    await conn.commit();
    res.json({success:true,message:"Password updated. You can log in now."});
  }catch(err){await conn.rollback();next(err)}finally{conn.release()}
};
