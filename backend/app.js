const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});