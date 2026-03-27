const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

const cafeRoutes = require("./routes/Cafe.routes");
const adminRoutes = require("./routes/admin.routes");
const orderRoutes = require("./routes/order.routes");

app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/cafe", cafeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", orderRoutes);
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/Cafes")
  .then(() => console.log("MongoDB Connected"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
