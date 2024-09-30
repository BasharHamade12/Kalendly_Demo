const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Path to the JSON file
const usersFilePath = path.join(__dirname, "users.json");

// Endpoint to update availability
app.post("/update-appointment", (req, res) => {
  const { userId, date, timeSlot } = req.body;

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading file" });
    }

    const usersData = JSON.parse(data);
    const user = usersData.users.find((u) => u.id === userId);
    console.log(timeSlot) 
    console.log(date)
    
    if (user) { 
      const availability = user.availability.find((a) => a.date === date); 
      console.log(availability.timeSlots)
      if (availability) {
        const slot = availability.timeSlots.find((slot) => slot.time === timeSlot);
        if (slot) {
          slot.isTaken = true;

          fs.writeFile(usersFilePath, JSON.stringify(usersData, null, 2), (err) => {
            if (err) {
              return res.status(500).json({ error: "Error writing to file" });
            }
            res.json({ message: "Appointment updated successfully" });
          });
        } else {
          res.status(404).json({ error: "Time slot not found" });
        }
      } else {
        res.status(404).json({ error: "Date not found" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
