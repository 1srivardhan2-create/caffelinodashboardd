const express = require("express");
const router = express.Router();

const authCafe = require("../middlewares/authCafe");
const cafeApproved = require("../middlewares/cafeApproved");

const {
  registerCafe,
  approveCafe,
  Logincafe,
  googleLogin,
  getCafeStatus,
  updateCafe,
  deleteCafe,
  getCafeById,
  MenuItem,
  EditMenuItem,
  toggleMenuAvailability,
  deleteItem,
  getItems,
  getItemById,
  getCafeOrders,
  updateOrderStatus,
  collectPayment,
  getCafeTotalAmount,
  getAllCafesAdmin,
  getApprovedCafesUser,
  getCafeDetailsUser,
  createOrderUser,
  deleteOrderDashboard,
  restoreOrderDashboard,
  updateProfilePhoto,
  updateGalleryPhotos,
  deleteGalleryPhoto
} = require("../controllers/cafe.controller");

const upload = require("../middlewares/upload");

// Auth routes
router.post("/google-login", googleLogin);
router.post("/login", Logincafe);
router.get("/status", authCafe, getCafeStatus);

// Registration with file uploads
router.post(
  "/register",
  upload.fields([
    { name: "Cafe_photos", maxCount: 10 },
    { name: "profile_picture", maxCount: 1 },
    { name: "upi_photo", maxCount: 1 }
  ]),
  registerCafe
);

router.patch("/approve/:id", approveCafe);
router.put("/editprofile", authCafe, cafeApproved, updateCafe);
router.get("/cafedetail",authCafe, cafeApproved,getCafeById);
router.get("/cafe/cafedetail", cafeApproved, getCafeById);
router.delete("/delete/cafe",  authCafe,cafeApproved, deleteCafe);

router.post("/menuItem/cafe", authCafe, cafeApproved, upload.single("image"), MenuItem);
router.put("/menuItem/edit/:id", authCafe, cafeApproved, upload.single("image"), EditMenuItem);
router.patch("/menuItem/availability/:id",authCafe, cafeApproved,  toggleMenuAvailability);
router.delete("/delete/item/:itemid",  authCafe,cafeApproved, deleteItem);

router.get("/items", authCafe,cafeApproved,  getItems);
router.get("/items/:menuId", authCafe, cafeApproved, getItemById);

router.get("/orders/cafe", authCafe, cafeApproved, getCafeOrders);
router.patch("/orders/:orderId/status", cafeApproved, authCafe, updateOrderStatus);
router.post("/orders/:orderId/collect-payment", cafeApproved, authCafe, collectPayment);
router.get("/orders/cafe/total", cafeApproved, authCafe, getCafeTotalAmount);
router.patch("/orders/:orderId/delete", authCafe, cafeApproved, deleteOrderDashboard);
router.patch("/orders/:orderId/restore", authCafe, cafeApproved, restoreOrderDashboard);

// Album photo management
router.post("/albums/profile", authCafe, cafeApproved, upload.single("profile_picture"), updateProfilePhoto);
router.post("/albums/gallery", authCafe, cafeApproved, upload.array("gallery_images", 10), updateGalleryPhotos);
router.delete("/albums/gallery/:index", authCafe, cafeApproved, deleteGalleryPhoto);

router.get("/dashboard", authCafe, cafeApproved, (req, res) => {
  res.json({ message: "Welcome to cafe dashboard" });
});

router.get("/admin/all", getAllCafesAdmin);
router.get("/user/approved", getApprovedCafesUser);
router.get("/user/:id", getCafeDetailsUser);
router.post("/user/:cafeId/order", createOrderUser);

module.exports = router;
