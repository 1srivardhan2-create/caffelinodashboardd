const Event = require('../models/Event.model');

// Shared projection to ensure sensitive data is NEVER leaked
const safeSelectFields = '-accountHolderName -bankName -accountNumber -ifscCode -upiId -organizerId';

// GET /api/mobile/events
// Return only published events where eventDate >= current date
exports.getAllMobileEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      status: 'published',
      eventDate: { $gte: today }
    })
    .select(safeSelectFields)
    .sort({ eventDate: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
};

// GET /api/mobile/events/featured
exports.getFeaturedMobileEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      status: 'published',
      isFeatured: true,
      eventDate: { $gte: today }
    })
    .select(safeSelectFields)
    .sort({ eventDate: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching featured events', error: error.message });
  }
};

// GET /api/mobile/events/search
exports.searchMobileEvents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query "q" is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const searchRegex = new RegExp(q, 'i');

    const events = await Event.find({
      status: 'published',
      eventDate: { $gte: today },
      $or: [
        { eventName: searchRegex },
        { eventCategory: searchRegex },
        { city: searchRegex },
        { organizerName: searchRegex },
        { cafeName: searchRegex }
      ]
    })
    .select(safeSelectFields)
    .sort({ eventDate: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching events', error: error.message });
  }
};

// GET /api/mobile/events/:id
exports.getMobileEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // We only return it if it is published
    const event = await Event.findOne({
      _id: id,
      status: 'published'
    }).select(safeSelectFields);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or not published' });
    }

    // Increment views for analytics
    event.views = (event.views || 0) + 1;
    await event.save();

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event details', error: error.message });
  }
};
