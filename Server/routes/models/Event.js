 const mongoose = require('mongoose');

// Assume you have a User model already defined
const User = require('./User'); // Adjust the path as necessary

// Schema for individual time slots
const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  
  isAvailable: { type: Boolean, default: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

// Schema for available days
const availableDaySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [timeSlotSchema]
});

// Main event schema
const eventSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  availableDays: [availableDaySchema],
  duration: { type: Number, required: true }, // Duration of each time slot in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;