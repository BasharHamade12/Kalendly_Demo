const express = require('express');
const mongoose = require('mongoose');
const Event = require('./models/Event'); 
const User = require('./models/User');
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

  // Add this function to your events.js file

router.post('/api/events/:eventId/book', async (req, res) => {
  const { eventId } = req.params;
  const { date, startTime,userId } = req.body;
  console.log("soiho soidhio iosi")
  if (!date || !startTime || !userId) { 
    
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try { 
    console.log("soifhiosehfiosehfio soiho soidhio iosi duihsiohioshif ")
    const event = await Event.findById(eventId);
    
    if (!event) { 
      
      return res.status(404).json({ message: 'Event not found' });
    }
    const formattedDate = date.date.split('T')[0];
    console.log("the date ", formattedDate);

    const availableDay = event.availableDays.find(day => {
      console.log(`Iterating over day: ${day.date.toISOString().split('T')[0]}`);
      return day.date.toISOString().split('T')[0] === formattedDate;
    });
    console.log("DAY AVAILABLE",availableDay)
    if (!availableDay) {
      return res.status(404).json({ message: 'Date not found in available days' });
    }
    
    const timeSlot = availableDay.timeSlots.find(slot => slot.startTime === startTime);
    console.log("timeslot available",timeSlot)
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    if (!timeSlot.isAvailable) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Update the time slot
    timeSlot.isAvailable = false;
    //timeSlot.bookedBy = userId; 
    

    await event.save();

    res.status(200).json({ message: 'Time slot booked successfully', timeSlot });
  } catch (error) {
    console.error('Error booking time slot:', error);
    res.status(500).json({ message: 'Error booking time slot', error: error.message });
  }
});


  const eventLinkHandler = async (req, res) => {
    try {
      const { eventName, creatorName } = req.params;
      console.log(eventName,creatorName)
      // Find the creator by name
      const creator = await User.findOne({ name: creatorName }); 
      console.log("creator pass")
      if (!creator) { 
        console.log("creator error")
        return res.status(404).json({ message: 'Creator not found' });
      }
  
      // Find the event by name and creator's ID
      const event = await Event.findOne({ title: eventName});
      console.log("event pass")
      if (!event) { 

        return res.status(404).json({ message: 'Event not found' });
      }
  
      res.json(event);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Express route setup
  router.get('/api/eventlink/:eventName/:creatorName', eventLinkHandler);

module.exports = router;
