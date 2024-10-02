const express = require('express');
const mongoose = require('mongoose');
const Event = require('./models/Event');
const router = express.Router();

// POST endpoint to create a new event
router.post('/api/events', async (req, res) => { 
    console.log(req.body);
  const { creator, title, description, availableDays, duration } = req.body;

  // Basic validation checks
  if (!creator || !title || !description || !duration || !availableDays || !availableDays.length) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const creatorId = new mongoose.Types.ObjectId(creator);

    const newEvent = new Event({
      creator: creatorId,
      title,
      description,
      availableDays: availableDays,
      duration
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
}); 

router.get('/api/events/user/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const creatorId = new mongoose.Types.ObjectId(userId);
      const events = await Event.find({ creator: creatorId });
  
      if (events.length === 0) {
        return res.status(404).json({ message: 'No events found for this user' });
      }
  
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
  });

module.exports = router;
