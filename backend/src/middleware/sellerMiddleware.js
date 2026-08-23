module.exports=(req,res,next)=>{if(req.user?.role!=="SELLER")return res.status(403).json({success:false,message:"Seller access required"});next()};
