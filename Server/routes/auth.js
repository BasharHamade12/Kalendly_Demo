const express = require('express');
const User  = require('./models/User'); // Assuming the user model is created
const router = express.Router(); 


// Route to get all users
router.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      console.log('Sending users:', JSON.stringify(users, null, 2)); // Pretty print users for debugging
      res.json(users); // Make sure we're sending JSON
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  

// Route to receive user data from frontend Google login
router.post('/api/auth/google', async (req, res) => {
  const { googleId, email, name, imageUrl } = req.body;
    console.log(User)
  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ googleId });
    console.log(user)
    if (user) {
      // If the user exists, send the existing user data as a response
      res.status(200).json({ message: 'User already exists', user });
    } else {
      // If the user doesn't exist, create a new user
      const newUser = new User({
        googleId,
        email,
        name,
        imageUrl,
        events: [], // Initialize an empty array for events
      });

      // Save the new user to the database
      await newUser.save();

      res.status(201).json({ message: 'New user created', user: newUser });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
