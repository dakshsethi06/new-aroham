import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import astrologerRoutes from "./routes/astrologerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/astrologers", astrologerRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "aroham-admin-portal-backend", timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🕉️  Aroham Admin Portal Server running on http://localhost:${PORT}`);
  });
}

export default app;
