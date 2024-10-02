const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Import and use routes
const authRoutes = require('./routes/auth'); // Route to handle Google login data
const eventRoutes = require('./routes/events'); // Route to handle Google login data

app.use(authRoutes); 
app.use(eventRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error(err));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
