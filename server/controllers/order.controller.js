const Order = require("../models/Cafe/Cafe_orders");
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, cafeId, subtotal, cgst, sgst } = req.body;
    
    const dummyUserId = new mongoose.Types.ObjectId();
    
    const orderData = {
      ...req.body,
      user: dummyUserId,
      cafe: cafeId, // Sets the ObjectId ref for web dashboard backward-compatibility
      cafeId: cafeId, // Sets the string ref directly
      items: items.map(i => ({
        menuItem: i.id || i.menuItem,
        name: i.name || "Item",
        quantity: i.quantity,
        price: i.price
      })),
      subtotal: subtotal || 0,
       cgst: cgst || 0,
      sgst: sgst || 0,
      totalAmount: totalAmount,
      orderStatus: req.body.status || "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "CASH"
    };

    const order = new Order(orderData);
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // If accessed via cafe dashboard, req.cafe is populated
    const cafeId = req.cafe ? req.cafe.id : req.query.cafeId;
    
    const query = cafeId ? { $or: [{ cafe: cafeId }, { cafeId: cafeId }] } : {};
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const cafeId = req.cafe ? req.cafe.id : req.query.cafeId;
    const query = cafeId ? { $or: [{ cafe: cafeId }, { cafeId: cafeId }] } : {};
    
    query.orderStatus = { $in: ["COMPLETED", "completed"] };
    
    const completedOrders = await Order.find(query);
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const commission = totalRevenue * 0.06;
    const totalEarnings = totalRevenue - commission;
    
    res.json({
      totalRevenue,
      totalEarnings,
      totalOrders: completedOrders.length
    });
  } catch (err) {
    console.error("Get earnings error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support finding by the document _id
    // Update both status and orderStatus to be fully compatible with frontend and backend logic
    await Order.findByIdAndUpdate(id, {
      status: "completed",
      orderStatus: "COMPLETED"
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Complete order error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Public endpoint — fetch single order by ID (used when QR code is scanned)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Also try to get cafe name for display
    let cafeName = '';
    try {
      const Cafe = require("../models/Cafe/Cafe_login");
      const cafeDoc = await Cafe.findById(order.cafe || order.cafeId);
      if (cafeDoc) cafeName = cafeDoc.Name || '';
    } catch (e) {
      // Cafe lookup is optional, don't fail the request
    }

    res.json({
      success: true,
      order: {
        ...order.toObject(),
        cafeName: cafeName || order.cafeName || ''
      }
    });
  } catch (err) {
    console.error("Get order by ID error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};
