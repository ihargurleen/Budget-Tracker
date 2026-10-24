
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./api/routes/auth.routes.js";
import categoryRouter from "./api/routes/category.routes.js";
import budgetRouter from "./api/routes/budget.routes.js";
import purchaseRouter from "./api/routes/purchase.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://budget-tracker-one-mocha-74.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/purchase", purchaseRouter);

export default app;
