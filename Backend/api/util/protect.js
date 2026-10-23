import jwt from "jsonwebtoken";
import { Auth } from "../modal/auth.schema.js";


export const protect = async(req, res, next) =>{
    try{
       const token = req.cookies.token;
    //    console.log(token, "gurleen")
       if(!token){
        return res.status(401).json({
            message: "Unauthorized"
        });
       }
      const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await Auth.findById({_id: decoded.id}).select("-password");
      if(!user){
        return res.status(401).json({
            message: "User not Found"
        }); 
         }
          req.user = user;
          next();
    }catch(err){
        return res.status(403).json({
            message: "Invalid Token",
        });
    }
};