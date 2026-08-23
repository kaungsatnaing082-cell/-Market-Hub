require("dotenv").config();
const app=require("./app");
const db=require("./config/db");

const port=Number(process.env.PORT||5000);

(async()=>{
  try{
    await db.query("SELECT 1");
    console.log("✅ MySQL connected");
  }catch(err){
    console.error("❌ MySQL connection failed:",err.message);
  }
  app.listen(port,()=>console.log(`🚀 Krest Center running at http://localhost:${port}`));
})();
