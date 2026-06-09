const Event = require('../models/Event.model');
const User = require('../models/User.model');

const formatLegacyData = (val) => {
  if (!val) return null;
  // If value contains IV separator and is a long hex string, mark it as legacy
  if (val.includes(':') && val.length > 30) {
    return 'Encrypted Legacy Data';
  }
  return val;
};

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

    // Format bank details to handle legacy encrypted strings
    let decryptedBankDetails = {};
    if (event.accountHolderName || event.paymentMobileNumber || event.upiId || event.bankName || event.accountNumber || event.ifscCode) {
      decryptedBankDetails = {
        accountHolderName: formatLegacyData(event.accountHolderName),
        paymentMobileNumber: formatLegacyData(event.paymentMobileNumber),
        upiId: formatLegacyData(event.upiId),
        bankName: formatLegacyData(event.bankName),
        accountNumber: formatLegacyData(event.accountNumber),
        ifscCode: formatLegacyData(event.ifscCode)
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
