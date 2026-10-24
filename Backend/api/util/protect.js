
import jwt from "jsonwebtoken";
import { Auth } from "../modal/auth.schema.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    const user = await Auth.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
