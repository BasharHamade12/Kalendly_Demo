import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Required for handling __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5173;

// Middleware to parse JSON bodies
app.use(express.json());

// Path to the JSON file
const usersFilePath = path.join(__dirname, "users.json");

// API endpoint to update availability
app.get("/update-appointment", (req, res) => { 
    console.log("hit")
  const { userId, date, timeSlot } = req.body;

  // Read the current users data
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading file" });
    }

    const usersData = JSON.parse(data);
    const user = usersData.users.find((u) => u.id === userId);

    if (user) {
      // Find the date and time slot to update
      const availability = user.availability.find((a) => a.date === date);
      if (availability) {
        const slot = availability.timeSlots.find((slot) => slot.time === timeSlot);
        if (slot) {
          slot.isTaken = true;

          // Write the updated data back to the file
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
  console.log(`Server running on port ${port}`);
});
