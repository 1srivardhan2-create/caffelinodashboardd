const express = require("express");
const router = express.Router();
const authCafe = require("../middlewares/authCafe");
const { createOrder, getOrders, getEarnings, completeOrder, getLatestOrder } = require("../controllers/order.controller");

router.post("/orders/create", createOrder);
router.get("/orders", authCafe, getOrders);
router.get("/orders/latest", authCafe, getLatestOrder);
router.put("/orders/complete/:id", authCafe, completeOrder);
router.get("/earnings", authCafe, getEarnings);

module.exports = router;
