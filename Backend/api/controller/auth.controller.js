import { Auth } from "../modal/auth.schema.js";
import jwt from "jsonwebtoken";
import { genToken } from "../util/genToken.js";

export const signup = async (req,res,next ) => {
    try{
      const {userName,email,password} = req.body;
      // console.log(req.body)
      if(!userName|| !email || !password){
        return res.status(400).json(" All fields are required ");
      }
      const isUserExists = await Auth.findOne({email});
      if(isUserExists) {
        return res.status(400).json({ // 400 user note find
            message: "Email is already exist"
        });
      }
      const user = await Auth.create({
        userName,
        email,
        password,
      });
      return res.status(201).json({
        message: "User register successfully",
        data:{
            _id:user._id,                             
            email: user.email,
        },
      }); 
    } catch(err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

export const signin = async (req,res,next ) => {
  try{

   
    const {email, password}= req.body;
    if( !email || !password){
    return res.status(400).json({
        message:"All fields are required"
       });
    }
    const user = await Auth.findOne({email});
   
    if(!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }
          
    const isPassword = await user.comparePassword(password);

    if(!isPassword)
{
  return res.status(400).json({
    message: "Password is incorrect",
  });
} 
   const token = await genToken(user._id,user.userName,user.email);

  //  console.log(token , "gur")


return res.status(200).cookie("token",token,{
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
})
.json({
  message:" User signin successfully",
  data: {
    _id: user._id,
    userName: user.userName,
    email: user.email,
  
  },
});
}
  catch(err){
     return res.status(500).json({
      message: err.message
     });
  }
}

export const getUser =  async(req, res ,next) => {
 try{
    const user = await Auth.findOne({_id: req.user._id});
    if(!user){
      return res.status(400).json({
        message: "User not found"
      });
    }
    return res.status(200).json({
      message: "User signin successfully",
      data: {
        _id: user._id,
        userName: user.userName,
        email: user.email
      },
    })
 }catch(err){
  return res.status(500).json({
    message: err.message,
  });
 }
};
export const signout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });

        return res.status(200).json({
            message: "Signout successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};