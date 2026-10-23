import express from "express"
import { signup , signin, getUser, signout } from "../controller/auth.controller.js";
import { protect } from "../util/protect.js";

const router = express.Router();


router.post("/signup", signup);
router.post("/signin",signin);
router.get("/get-user",protect,getUser)
router.post("/signout" , signout);
export default router;
