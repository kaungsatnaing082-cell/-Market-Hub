require("dotenv").config();
const bcrypt=require("bcryptjs");
const db=require("../src/config/db");

(async()=>{
  try{
    const name=process.env.ADMIN_NAME||"Krest Center Admin";
    const email=process.env.ADMIN_EMAIL;
    const password=process.env.ADMIN_PASSWORD;
    if(!email||!password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
    const hash=await bcrypt.hash(password,12);
    const [rows]=await db.query("SELECT id FROM users WHERE email=? LIMIT 1",[email]);
    if(rows.length){
      await db.query("UPDATE users SET name=?,password_hash=?,role='ADMIN',status='ACTIVE' WHERE id=?",[name,hash,rows[0].id]);
      console.log("✅ Existing user updated as admin:",email);
    }else{
      await db.query("INSERT INTO users(name,email,password_hash,role,status) VALUES(?,?,?,'ADMIN','ACTIVE')",[name,email,hash]);
      console.log("✅ Admin created:",email);
    }
  }catch(e){console.error("❌",e.message);process.exitCode=1}
  finally{await db.end()}
})();
