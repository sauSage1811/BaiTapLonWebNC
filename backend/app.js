require("dotenv").config();

["JWT_SECRET", "ADMIN_INVITE_CODE"].forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const tableRoutes = require("./routes/tableRoutes");
const orderRoutes = require("./routes/orderRoutes");
const revenueRoute = require("./routes/revenueRoute");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL;

app.use(
    cors({
        origin: frontendUrl ? [frontendUrl, "http://127.0.0.1:5173"] : ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", revenueRoute);
app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
