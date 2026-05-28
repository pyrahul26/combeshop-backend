require('dotenv').config();

const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors");

const port = process.env.PORT || 4009;

require('./config/db');

// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ================= VIEW ENGINE =================

app.set("view engine", "ejs");

// ================= STATIC FOLDER =================

app.use(express.static("public"));

// ================= ROUTES =================

// user route
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// products route
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// admin route
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// payment route
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ================= SERVER =================

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;