require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const tableRoutes = require("./routes/tableRoutes");
const createOrderRoute = require("./routes/createOrderRoute");
const addItemRoute = require("./routes/addItemRoute");

const app = express();
const port = Number(process.env.PORT) || 3000;
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [frontendOrigin, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: false
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Backend SQLite is running"
    });
});

app.get("/api/test-db", (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Không thể kết nối cơ sở dữ liệu"
            });
        }

        res.json({
            success: true,
            data: rows
        });
    });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", createOrderRoute);
app.use("/api/orders", addItemRoute);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});