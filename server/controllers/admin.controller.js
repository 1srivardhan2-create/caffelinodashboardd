const Event = require('../models/Event.model');
const User = require('../models/User.model');
const { decrypt } = require('../utils/cryptoHelper');

exports.getEventFullDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Find the organizer details
    const organizer = await User.findById(event.organizerId).select('-password');

    // Decrypt bank details
    let decryptedBankDetails = {};
    if (event.accountHolderName || event.paymentMobileNumber || event.upiId) {
      decryptedBankDetails = {
        accountHolderName: event.accountHolderName ? decrypt(event.accountHolderName) : null,
        paymentMobileNumber: event.paymentMobileNumber ? decrypt(event.paymentMobileNumber) : null,
        upiId: event.upiId ? decrypt(event.upiId) : null,
      };
    }

    // Remove raw encrypted data from the event object returned to prevent confusion
    const eventObj = event.toObject();
    delete eventObj.accountHolderName;
    delete eventObj.paymentMobileNumber;
    delete eventObj.upiId;
    delete eventObj.bankName;
    delete eventObj.accountNumber;
    delete eventObj.ifscCode;

    res.status(200).json({
      success: true,
      event: eventObj,
      organizer,
      decryptedBankDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching full details', error: error.message });
  }
};
