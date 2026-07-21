require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const tableRoutes = require("./routes/tableRoutes");
const storeSettingsRoutes = require("./routes/storeSettingsRoutes");

const createOrderRoute = require("./routes/createOrderRoute");
const addItemRoute = require("./routes/addItemRoute");
const payOrderRoute = require("./routes/payOrderRoute");

const searchProductRoute = require("./routes/searchProductRoute");
const revenueRoute = require("./routes/revenueRoute");
const orderHistoryRoute = require('./routes/orderHistoryRoute');

const app = express();
const port = 3000;

app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Các route cơ bản
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/store-settings", storeSettingsRoutes);


app.use('/api/orders', orderHistoryRoute);

// Các route order khác nằm bên dưới
app.use("/api/orders", createOrderRoute);
app.use("/api/orders", addItemRoute);
app.use("/api/orders", payOrderRoute);

app.use("/api/search", searchProductRoute);
app.use("/api/analytics", revenueRoute);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
