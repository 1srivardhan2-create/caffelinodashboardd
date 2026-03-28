const Cafe = require("../models/Cafe/Cafe_login");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Menu=require("../models/Cafe/cafe_menu")
const Order = require("../models/Cafe/Cafe_orders")
const CashCollection=require("../models/Cafe/Collection_cafe")
const uploadBuffer = require("../utils/uploadToCloudinary");
const mongoose = require("mongoose");


// GOOGLE LOGIN - verify Google token, find/create cafe entry
const googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "Access token required" });
    }

    // Verify with Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const googleUser = await googleRes.json();
    const { email, name, sub: googleId } = googleUser;

    // Find existing cafe by email
    let cafe = await Cafe.findOne({ email_address_manager: email });

    if (cafe) {
      // Existing cafe - generate token and return
      const token = jwt.sign(
        { id: cafe._id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        message: "Login successful",
        user: { name: name || cafe.managerName, email },
        cafe: {
          id: cafe._id,
          name: cafe.Name,
          status: cafe.status,
          hasCafe: true,
          address: cafe.Cafe_Address,
          location: cafe.cafe_location,
          category: cafe.Cafe_type?.[0] || '',
          costPerPerson: cafe.Average_Cost,
          managerName: cafe.managerName,
          managerPhone: cafe.Phonenumber,
          email: cafe.email_address_manager,
          galleryImages: cafe.Cafe_photos || [],
          profilePicture: cafe.Cafe_photos?.length > 0 ? cafe.Cafe_photos[0] : '',
          openingTime: cafe.opening_hours?.monday?.open || '',
          closingTime: cafe.opening_hours?.monday?.close || ''
        },
        token
      });
    }

    // No cafe yet — return user info so frontend can direct to registration
    return res.status(200).json({
      message: "User authenticated, no cafe registered",
      user: { name, email, googleId },
      cafe: { hasCafe: false }
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CHECK CAFE STATUS for logged-in user
const getCafeStatus = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const cafe = await Cafe.findById(cafeId);

    if (!cafe) {
      return res.status(200).json({ hasCafe: false });
    }

    return res.status(200).json({
      hasCafe: true,
      status: cafe.status,
      name: cafe.Name,
      id: cafe._id,
      address: cafe.Cafe_Address,
      location: cafe.cafe_location,
      category: cafe.Cafe_type?.[0] || '',
      costPerPerson: cafe.Average_Cost,
      managerName: cafe.managerName,
      managerPhone: cafe.Phonenumber,
      email: cafe.email_address_manager,
      galleryImages: cafe.Cafe_photos || [],
      profilePicture: cafe.Cafe_photos?.length > 0 ? cafe.Cafe_photos[0] : '',
      openingTime: cafe.opening_hours?.monday?.open || '',
      closingTime: cafe.opening_hours?.monday?.close || ''
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//REGISTER CAFE 
const registerCafe = async (req, res) => {
  try {
    const {
      Name,
      Cafe_Address,
      cafe_location,
      Cafe_type,
      Average_Cost,
      AboutCafe,
      password,
      managerName,
      Phonenumber,
      designation,
      AlternateContact,
      email_address_manager,
      paymentMethods,
      opening_hours,
      latitude,
      longitude
    } = req.body;

    if (!Name || !Cafe_Address || !Cafe_type ||
        !Average_Cost || !managerName ||
        !Phonenumber || !email_address_manager) {
      return res.status(400).json({ message: "Fill all required fields" });
    }

    const exists = await Cafe.findOne({ email_address_manager });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    // 🔹 Upload cafe photos
    const Cafe_photos = [];
    if (req.files?.Cafe_photos) {
      for (const file of req.files.Cafe_photos) {
        const url = await uploadBuffer(file.buffer, "cafes/photos");
        Cafe_photos.push(url);
      }
    }

    // 🔹 Upload profile picture as first cafe photo if provided
    if (req.files?.profile_picture) {
      const profileUrl = await uploadBuffer(
        req.files.profile_picture[0].buffer,
        "cafes/profile"
      );
      Cafe_photos.unshift(profileUrl);
    }

    if (Cafe_photos.length < 4)
      return res.status(400).json({ message: `Need at least 4 cafe photos (got ${Cafe_photos.length})` });

    // 🔹 Upload UPI photo (optional for Google OAuth flow)
    let upi_photo = "";
    if (req.files?.upi_photo) {
      upi_photo = await uploadBuffer(
        req.files.upi_photo[0].buffer,
        "cafes/upi"
      );
    }

    // Hash password (auto-generate for Google OAuth users)
    const pwd = password || ("google_" + Date.now() + "_" + Math.random().toString(36).slice(2));
    const hashedPwd = await bcrypt.hash(pwd, 10);

    // Build location string
    const locationStr = cafe_location || (latitude && longitude ? `${latitude},${longitude}` : "0,0");

    const cafe = await Cafe.create({
      Name,
      Cafe_Address,
      cafe_location: locationStr,
      Cafe_type: Array.isArray(Cafe_type) ? Cafe_type : [Cafe_type],
      Average_Cost,
      AboutCafe: AboutCafe || "A great place to enjoy food and drinks",
      password: hashedPwd,
      managerName,
      Phonenumber,
      designation: designation || "Manager",
      AlternateContact: AlternateContact || "",
      email_address_manager,
      paymentMethods: paymentMethods ? (Array.isArray(paymentMethods) ? paymentMethods : [paymentMethods]) : ["CASH"],
      opening_hours: typeof opening_hours === 'string' ? JSON.parse(opening_hours || "{}") : (opening_hours || {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "22:00", closed: false },
        saturday: { open: "09:00", close: "22:00", closed: false },
        sunday: { open: "09:00", close: "22:00", closed: false },
      }),
      Cafe_photos,
      upi_photo: upi_photo || "https://via.placeholder.com/200",
      status: "pending",
      role: "cafe"
    });

    const token = jwt.sign(
      { id: cafe._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "Cafe registered successfully. Waiting for admin approval.",
      cafe: {
        id: cafe._id,
        name: cafe.Name,
        status: cafe.status,
        address: cafe.Cafe_Address,
        location: cafe.cafe_location,
        category: cafe.Cafe_type?.[0] || '',
        costPerPerson: cafe.Average_Cost,
        managerName: cafe.managerName,
        managerPhone: cafe.Phonenumber,
        email: cafe.email_address_manager,
        galleryImages: cafe.Cafe_photos || [],
        profilePicture: cafe.Cafe_photos?.length > 0 ? cafe.Cafe_photos[0] : '',
        openingTime: cafe.opening_hours?.monday?.open || '',
        closingTime: cafe.opening_hours?.monday?.close || ''
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//Cafelio vardhanleo@gmail.com password123
//id : 696679db2ee5e5ae201de76e

const Logincafe = async (req, res) => {
  const { cafename, email, password } = req.body;
  console.log("req.body ===>", req.body);

  try {
    if (!cafename || !email || !password) return res.status(400).json({ message: "Please fill the form in detail" });

    const cafe = await Cafe.findOne({ Name: cafename, email_address_manager: email });
    if (!cafe) return res.status(400).json({ message: `Cafe Not found with name ${cafename}` });

    const isApproved = cafe.status === true || cafe.status === "true" || cafe.status === "approved";
    if (!isApproved) {
      return res.status(403).json({
        message: "Cafe not approved by admin yet"
      });
    }

    const match = await bcrypt.compare(password, cafe.password);
    if (!match) return res.status(401).json({ message: "Incorrect Password !!! Check Again !!!!" });

    const token = jwt.sign({ id: cafe._id }, 'secret', { expiresIn: '1d' });

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful !!!",
      cafe,
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.cafe.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    Object.assign(cafe, req.body);

    if (req.body.password) {
      cafe.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.files?.Cafe_photos) {
      const photos = [];
      for (const file of req.files.Cafe_photos) {
        photos.push(await uploadBuffer(file.buffer, "cafes/photos"));
      }
      if (photos.length < 5)
        return res.status(400).json({ message: "Minimum 5 cafe photos required" });

      cafe.Cafe_photos = photos;
    }

    if (req.files?.upi_photo) {
      cafe.upi_photo = await uploadBuffer(
        req.files.upi_photo[0].buffer,
        "cafes/upi"
      );
    }

    await cafe.save();

    const { password, ...safeCafe } = cafe.toObject();
    res.status(200).json({ message: "Cafe updated", cafe: safeCafe });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndDelete(req.cafe.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    res.clearCookie("token");
    res.status(200).json({ message: "Cafe deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getCafeById=async(req,res)=>{
  try{
const cafeId=req.cafe.id;

const cafe=await Cafe.findById(cafeId)

if(!cafe){
  return res.status(404).json({"message":"Cafe Not found"})
}

return res.status(200).json({message:"Data retrieved",data:cafe})

  }catch(error){
    console.error(error)
    return res.status(500).json({message:error.message})
  }
}

const MenuItem = async (req, res) => {
  const {
    item_name,
    Category,
    food_type,
    price,
    description_food,
    image_url, // fallback for existing strings
    available
  } = req.body;

  const cafeId = req.cafe.id;

  try {
    if (!item_name || !Category || !food_type || price === undefined) {
      return res.status(400).json({
        message: "Fill required details"
      });
    }

    let finalImageUrl = image_url;
    if (req.file) {
      try {
        finalImageUrl = await uploadBuffer(req.file.buffer, "cafes/menu");
      } catch (uploadError) {
        console.error("Cloudinary Error in MenuItem block:", uploadError.message);
        finalImageUrl = image_url || "https://via.placeholder.com/400?text=Upload+Failed";
      }
    }

    const menuItem = await Menu.create({
      item_name,
      Category,
      food_type,
      price,
      description_food,
      image_url: finalImageUrl,
      cafe_owner: cafeId,
      available: available === 'false' || available === false ? false : true
    });

    return res.status(201).json({
      message: "Menu item created successfully",
      data: menuItem
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
};

const EditMenuItem=async(req,res)=>{
  const {
    item_name,
    Category,
    food_type,
    price,
    description_food,
    image_url,
    available
  } = req.body;
  const cafeId = req.cafe.id;
  const {id}=req.params
  try{
  const cafe = await Cafe.findById(cafeId);
  if(!cafe) return res.status(404).json({"message":"Cafe not found"})
    const menuItem=await Menu.findOne({
  _id:id,
  cafe_owner:cafeId
    })

     if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found or unauthorized"
      });
    }

    let finalImageUrl = image_url;
    if (req.file) {
      try {
        finalImageUrl = await uploadBuffer(req.file.buffer, "cafes/menu");
      } catch (uploadError) {
        console.error("Cloudinary Error in EditMenuItem block:", uploadError.message);
        // Retain original image or fallback
        finalImageUrl = menuItem.image_url; 
      }
    }

    if (item_name !== undefined) menuItem.item_name = item_name;
    if (Category !== undefined) menuItem.Category = Category;
    if (food_type !== undefined) menuItem.food_type = food_type;
    if (price !== undefined) menuItem.price = price;
    if (description_food !== undefined) menuItem.description_food = description_food;
    if (finalImageUrl !== undefined) menuItem.image_url = finalImageUrl;
    if (available !== undefined) menuItem.available = available === 'false' || available === false ? false : true;
  
    await menuItem.save();

    return res.status(200).json({
      message: "Menu item updated successfully",
      data: menuItem
    });

  }catch(error){
     console.error(error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
}

const approveCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    res.json({
      success: true,
      message: "Cafe approved successfully",
      cafe,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleMenuAvailability = async (req, res) => {
  const { id } = req.params; // menu item id

  try {
    const cafeId = req.cafe.id; // from cookie auth middleware

    const menuItem = await Menu.findOne({
      _id: id,
      cafe_owner: cafeId
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found or unauthorized"
      });
    }

    //TOGGLE availability
    menuItem.available = !menuItem.available;

    await menuItem.save();

    return res.status(200).json({
      message: "Availability updated",
      available: menuItem.available
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteItem = async (req, res) => {
  const { itemid } = req.params;

  try {
    const cafeId = req.cafe.id;

    const menuItem = await Menu.findOne({
      _id: itemid,
      cafe_owner: cafeId
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Item not found or unauthorized"
      });
    }

    await Menu.deleteOne({ _id: itemid });

    return res.status(200).json({
      message: "Deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to delete item"
    });
  }
};

const getItems = async (req, res) => {
  try {
    const cafeId = req.cafe.id; // from JWT cookie

    const items = await Menu.find({ cafe_owner: cafeId })
      .sort({ createdAt: -1 }).populate("cafe_owner","Name  Cafe_Address cafe_location Cafe_type Average_Cost AboutCafe  managerName Phonenumber designation AlternateContact email_address_manager paymentMethods opening_hours");

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch menu items"
    });
  }
};


const getItemById = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const { menuId } = req.params;

    const item = await Menu.findOne({
      _id: menuId,
      cafe_owner: cafeId
    }).populate(
      "cafe_owner",
      "Name Cafe_Address cafe_location Cafe_type Average_Cost AboutCafe managerName Phonenumber designation AlternateContact email_address_manager paymentMethods opening_hours"
    );

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json(item);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch menu item"
    });
  }
};

const getCafeOrders = async (req, res) => {
  try {
    const cafeId = req.cafe.id;

    // Query orders from BOTH web (cafe ObjectId) and mobile (cafeId string)
    const orders = await Order.find({
      $or: [
        { cafe: cafeId },
        { cafeId: cafeId }
      ]
    })
      .populate("user", "name phone")
      .populate("items.menuItem", "item_name")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);

  } catch (error) {
    console.error("getCafeOrders error:", error);
    return res.status(500).json({ message: "Failed to fetch cafe orders" });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, $or: [{ cafe: cafeId }, { cafeId: cafeId }] },
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);

  } catch (error) {
    return res.status(500).json({ message: "Failed to update order" });
  }
};



const collectPayment = async (req, res) => {
  try {
    const cafeId = req.cafe.id; // from cookie auth
    const { orderId } = req.params;
    const { paymentMode, collectedAmount } = req.body;

    if (!paymentMode || !collectedAmount) {
      return res.status(400).json({ message: "Payment mode & amount required" });
    }

    // 1️⃣ Find order belonging to this cafe
    const order = await Order.findOne({ _id: orderId, $or: [{ cafe: cafeId }, { cafeId: cafeId }] });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Update order payment details
    order.paymentStatus = "PAID";
    order.paymentMethod = paymentMode;
    await order.save();

    // 3️⃣ Create cash collection entry
    const collection = await CashCollection.create({
      order: order._id,
      expectedAmount: order.totalAmount,
      collectedAmount,
      status:
        collectedAmount < order.totalAmount ? "PARTIAL" : "COLLECTED",
      Mode: paymentMode,
      cafe: cafeId
    });

    return res.status(200).json({
      message: "Payment collected successfully",
      order,
      collection
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to collect payment"
    });
  }
};

const getCafeTotalAmount = async (req, res) => {
  try {
    const cafeId = req.cafe.id;

    const result = await Order.aggregate([
      {
        $match: {
          cafe: new mongoose.Types.ObjectId(cafeId),
          paymentStatus: "PAID"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    return res.status(200).json({
      totalAmount: result[0]?.totalAmount || 0
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch total amount"
    });
  }
};



const getAllCafesAdmin = async (req, res) => {
  try {
    const cafes = await Cafe.find().sort({ createdAt: -1 });
    res.status(200).json(cafes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedCafesUser = async (req, res) => {
  try {
    const cafes = await Cafe.find({ status: { $in: ["approved", true] } }).sort({ createdAt: -1 });
    res.status(200).json(cafes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCafeDetailsUser = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });
    const menu = await Menu.find({ cafe_owner: req.params.id, available: true });
    res.status(200).json({ cafe, menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrderUser = async (req, res) => {
  try {
    const { items, subtotal, cgst, sgst, totalAmount } = req.body;
    const { cafeId } = req.params;

    if (!items || items.length === 0 || !totalAmount || subtotal === undefined) {
      return res.status(400).json({ message: "Invalid order payload" });
    }

    // Creating a dummy User ObjectId because the backend requires a "user" ref.
    const dummyUserId = new mongoose.Types.ObjectId();

    const order = await Order.create({
      user: dummyUserId,
      cafe: cafeId,
      items: items.map(i => ({
        menuItem: i.id,
        quantity: i.quantity,
        price: i.price
      })),
      subtotal,
      cgst,
      sgst,
      totalAmount,
      orderStatus: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "CASH"
    });

    res.status(201).json({ message: "Order successfully placed!", order });
  } catch (error) {
    console.error("Failed to create user order:", error);
    res.status(500).json({ message: "Server error creating order" });
  }
};

const deleteOrderDashboard = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, $or: [{ cafe: cafeId }, { cafeId: cafeId }] },
      { isDeleted: true },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order moved to trash", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};

const restoreOrderDashboard = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, $or: [{ cafe: cafeId }, { cafeId: cafeId }] },
      { isDeleted: false },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order restored to live feed", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore order" });
  }
};

// ===== ALBUM / PHOTO MANAGEMENT =====

const updateProfilePhoto = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let imageUrl;
    try {
      imageUrl = await uploadBuffer(req.file.buffer, "cafes/profile");
    } catch (uploadErr) {
      console.error("Cloudinary profile upload error:", uploadErr.message);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    // Store profile photo: replace first element of Cafe_photos, or prepend
    if (!cafe.Cafe_photos || cafe.Cafe_photos.length === 0) {
      cafe.Cafe_photos = [imageUrl];
    } else {
      cafe.Cafe_photos[0] = imageUrl;
    }

    await cafe.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Profile photo updated",
      profilePicture: imageUrl,
      galleryImages: cafe.Cafe_photos
    });

  } catch (error) {
    console.error("updateProfilePhoto error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateGalleryPhotos = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const uploadedUrls = [];
    for (const file of req.files) {
      try {
        const url = await uploadBuffer(file.buffer, "cafes/gallery");
        uploadedUrls.push(url);
      } catch (uploadErr) {
        console.error("Cloudinary gallery upload error:", uploadErr.message);
      }
    }

    if (uploadedUrls.length === 0) {
      return res.status(500).json({ message: "All image uploads failed" });
    }

    // Append new photos to existing gallery
    if (!cafe.Cafe_photos) cafe.Cafe_photos = [];
    cafe.Cafe_photos = [...cafe.Cafe_photos, ...uploadedUrls];

    await cafe.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: `${uploadedUrls.length} photo(s) added to gallery`,
      galleryImages: cafe.Cafe_photos,
      profilePicture: cafe.Cafe_photos[0] || ''
    });

  } catch (error) {
    console.error("updateGalleryPhotos error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteGalleryPhoto = async (req, res) => {
  try {
    const cafeId = req.cafe.id;
    const { index } = req.params;
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= (cafe.Cafe_photos?.length || 0)) {
      return res.status(400).json({ message: "Invalid photo index" });
    }

    cafe.Cafe_photos.splice(idx, 1);
    await cafe.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Photo removed",
      galleryImages: cafe.Cafe_photos,
      profilePicture: cafe.Cafe_photos[0] || ''
    });

  } catch (error) {
    console.error("deleteGalleryPhoto error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerCafe, Logincafe, approveCafe, googleLogin, getCafeStatus, updateCafe,deleteCafe,getCafeById,MenuItem,EditMenuItem,toggleMenuAvailability
  ,deleteItem,getItems,getItemById,getCafeOrders,updateOrderStatus,collectPayment,getCafeTotalAmount,getAllCafesAdmin,getApprovedCafesUser,getCafeDetailsUser,
  createOrderUser, deleteOrderDashboard, restoreOrderDashboard, updateProfilePhoto, updateGalleryPhotos, deleteGalleryPhoto };
