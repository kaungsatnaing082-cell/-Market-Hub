module.exports=function buyerMiddleware(req,res,next){if(req.user?.role!=="BUYER")return res.status(403).json({success:false,message:"Buyer access required"});next()};
