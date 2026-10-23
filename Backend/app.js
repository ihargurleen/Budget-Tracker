import express from "express";
import dotenv from "dotenv";
import authRouter from "./api/routes/auth.routes.js";
import categoryRouter from "./api/routes/category.routes.js";
import cookieParser from "cookie-parser";
import budgetRouter from "./api/routes/budget.routes.js";
import purchaseRouter from "./api/routes/purchase.routes.js"
import cors from "cors"

const app = express();

 //config
dotenv.config();




 //middleware
 app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
 })
);
app.use(express.json());
app.use(cookieParser());


 //routes
app.use("/api/auth", authRouter);
app.use("/api/category",categoryRouter);
app.use("/api/budget",budgetRouter);
app.use("/api/purchase", purchaseRouter);



 //http://localhost:3000/api/auth/signup

export default app;
