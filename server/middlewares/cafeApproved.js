const Cafe = require("../models/Cafe/Cafe_login");

const cafeApproved = async (req, res, next) => {
  if (!req.cafe || !req.cafe.id) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const cafe = await Cafe.findById(req.cafe.id);

  if (!cafe) {
    return res.status(404).json({
      message: "Cafe document not found in DB"
    });
  }

  const isApproved = cafe.status === true || cafe.status === "true" || cafe.status === "approved";

  if (!isApproved) {
    return res.status(403).json({
      message: `Not approved. Current status is: ${cafe.status}`
    });
  }

  next();
};

module.exports = cafeApproved;
