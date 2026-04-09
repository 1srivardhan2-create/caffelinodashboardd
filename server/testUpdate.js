const mongoose = require("mongoose");
const Cafe = require("./models/Cafe/Cafe_login");

mongoose.connect("mongodb+srv://vardhanleo:caffelinoPassword@caffelino.9i40e.mongodb.net/?retryWrites=true&w=majority&appName=CAFFELINO")
    .then(async () => {
        console.log("Connected to MongoDB.");
        try {
            const cafe = await Cafe.findOne();
            console.log("Found cafe:", cafe.Name, "current avg cost per person:", cafe.averageCostPerPerson, cafe.Average_Cost);

            cafe.averageCostPerPerson = 450;
            cafe.Average_Cost = "450";
            await cafe.save();
            console.log("Saved successfully!");

            const newCafe = await Cafe.findById(cafe._id);
            console.log("New value in DB:", newCafe.averageCostPerPerson, newCafe.Average_Cost);
        } catch (err) {
            console.error("Validation logic error:", err);
        }
        process.exit();
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
