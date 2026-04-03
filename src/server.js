import express from "express";
import cors from "cors";
import path from "path";
import { ENV } from "./config/env.js";

//users routes imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import skinAnalysisRoutes from "./routes/skinAnalysisRoutes.js";
import reccommendRoutes from "./routes/recommendRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
//admin routes imports
import adminAuthRoutes from "./AdminBE/routes/adminAuthRoutes.js";
import adminUserRoutes from "./AdminBE/routes/adminUserRoutes.js";
import outOfScopeRoutes from "./AdminBE/routes/outOfScopeRoutes.js";
import adminAnalysisRoutes from "./AdminBE/routes/analysisRoutes.js";
import skinTypeRoutes from "./AdminBE/routes/skinTypeRoutes.js";
import generateReportRoutes from "./AdminBE/routes/generateReportRoutes.js";

import skinCareProduct from "./AdminBE/routes/skinCareProductsRoutes.js";

const app = express();
const PORT = ENV.PORT || 6969;

//8081 is for mobile, while 5173 is for admin web
const allowedOrigins = ["http://localhost:8081", "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

//users
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/conditions", skinAnalysisRoutes);
app.use("/api/recommendations", reccommendRoutes);
app.use("/api/routines", routineRoutes);
//admin
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/products", skinCareProduct);
app.use("/api/admin/scope", outOfScopeRoutes);
app.use("/api/admin/analysis", adminAnalysisRoutes);
app.use("/api/admin/skin-types", skinTypeRoutes);
app.use("/api/admin/reports", generateReportRoutes);

app.listen(PORT, () => {
  console.log("Server started on PORT: ", PORT);
});
