const express = require("express");
const router = express.Router();
const authCafe = require("../middlewares/authCafe");
const { createOrder, getOrders, getEarnings, completeOrder, getOrderById } = require("../controllers/order.controller");

router.post("/orders/create", createOrder);
router.get("/orders", authCafe, getOrders);
router.put("/orders/complete/:id", authCafe, completeOrder);
router.get("/earnings", authCafe, getEarnings);

// Public route — used when QR code on bill is scanned
router.get("/orders/:id", getOrderById);

module.exports = router;
