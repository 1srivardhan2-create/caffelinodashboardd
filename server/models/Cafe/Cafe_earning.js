const mongoose=require("mongoose")

const Cafe_earn=mongoose.Schema({
    total: {
        type:Number,
        default:0
    },
    cashCollected: {
        type:Number,
        default:0
    },
    totalOrders: {
        type:Number,
        default:0
    },
    cashCollectionCount: {
        type:Number,
        default:0
    },
     cafe:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cafe",
        required:true
      }
},{ timestamps: true })

module.exports = mongoose.model("Cafeearnings", Cafe_earn);
