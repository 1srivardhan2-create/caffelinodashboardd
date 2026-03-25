const mongoose=require("mongoose")

const Cafe_menu=mongoose.Schema({
  item_name:{
    type:String,
    required:true
  },
  Category:{
    type:String,
    enum: ["Beverages", "Food", "Desserts"],
    required:true,
  },
  food_type:{
    type:String,
    enum: ["Veg", "Non-Veg"],
    required:true,
  },
  price:{
    type:Number,
    required:true
  },
  description_food:{
    type:String
  },
  image_url:{
    type:String,
  },
  available:{
 type: Boolean,
  default: true
  },
  cafe_owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Cafe",
    required:true
  }
},{ timestamps: true })


module.exports = mongoose.model("CafeMenu", Cafe_menu);
