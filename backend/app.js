const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const createOrderRoute = require("./routes/createOrderRoute");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const tableRoutes = require("./routes/tableRoutes");
//
const createOrderRoute = require("./routes/createOrderRoute");


const app = express();
const port = 3000;

app.use(cors());
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
                message: err.message
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
//
app.use("/api/orders", createOrderRoute);



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});