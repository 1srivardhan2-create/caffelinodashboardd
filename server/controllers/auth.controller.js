const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Fetch user info using the access_token
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      return res.status(401).json({ success: false, message: 'Invalid Google Token' });
    }

    const payload = await response.json();
    const { sub: googleId, name: fullName, email, picture: profilePicture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        fullName,
        email,
        profilePicture,
        role: 'organizer' // default role for events dashboard users
      });
      await user.save();
    } else {
      // Update Google ID if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'secret123';
    const authToken = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token: authToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
  }
};
