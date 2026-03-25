const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Server running ✅");
});

app.post("/api/create-order", (req, res) => {
  console.log("API HIT ✅", req.body);
  
  res.json({
    success: true,
    orderId: "demo123"
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
