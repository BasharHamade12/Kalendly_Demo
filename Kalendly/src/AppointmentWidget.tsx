import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import usersData from "../../Server/users.json"; // Import the JSON file directly
import { gapi } from "gapi-script"; // Google API client
import AppointmentSelector from "./AppointmentSelector";

const AppointmentWidget: React.FC = () => {
  const currentUserId = 1;
  const targetUserId = 2; // We're booking with Jane Smith

  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    const user = usersData.users.find((u) => u.id === targetUserId);
    if (user) {
      setTargetUser(user);
    }

    // Load Google Calendar API when the component mounts
    const initClient = () => {
      gapi.client.init({
        apiKey: "AIzaSyAaFpEqYP-N0h2dm1ZwAmO6EFwlF7kQW5M", // Replace with your API Key
        clientId: "468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com", // Replace with your Client ID
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
        scope: "https://www.googleapis.com/auth/calendar.events",
      });
    };

    gapi.load("client:auth2", initClient);
  }, []);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null); 

    if (date && targetUser) {
      const selectedDateString = date.toISOString().split("T")[0];
      const incrementedDate = new Date(selectedDateString);
      incrementedDate.setDate(incrementedDate.getDate() + 1); 
      const incrementedDateString = incrementedDate.toISOString().split("T")[0];
      const availability = targetUser.availability.find(
        (a: any) => a.date === incrementedDateString
      );

      if (availability) {
        setAvailableTimeSlots(availability.timeSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && targetUser) { 
      const event = {
        summary: `Appointment with ${targetUser.name}`,
        location: "Online",
        description: `Appointment scheduled with ${targetUser.name}.`,
        start: {
          dateTime: new Date(selectedDate.getTime()).toISOString(),
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: "America/Los_Angeles",
        },
        attendees: [{ email: "basharhamade99@gmail.com" }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      gapi.auth2.getAuthInstance().signIn().then(() => {
        const request = gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        request.execute((event: any) => {
          console.log("Event created: ", event.htmlLink);
          alert(`Appointment confirmed and added to Google Calendar. Event Link: ${event.htmlLink}`);  

          // Clone the selected date and increment by 1 day
          const incrementedDate = new Date(selectedDate);
          incrementedDate.setDate(incrementedDate.getDate() + 1);
          const incrementedDateString = incrementedDate.toISOString().split("T")[0];

          // Update the local state immediately
          const updatedTimeSlots = availableTimeSlots.map((slot: any) => 
            slot.time === selectedTime ? { ...slot, isTaken: true } : slot
          );

          setAvailableTimeSlots(updatedTimeSlots);

          // Update the targetUser's availability in the state
          const updatedAvailability = targetUser.availability.map((a: any) => {
            if (a.date === incrementedDateString) {
              return {
                ...a,
                timeSlots: updatedTimeSlots,
              };
            }
            return a;
          });

          setTargetUser({
            ...targetUser,
            availability: updatedAvailability,
          });

          // Call the backend server to update the JSON file
          fetch("http://localhost:3000/update-appointment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: targetUserId, // Example: 2 for Jane Smith
              date: incrementedDateString, // Format date as YYYY-MM-DD
              timeSlot: selectedTime, // Selected time, e.g. "09:00 AM"
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message) {
                console.log(data.message);
              } else {
                console.error(data.error);
              }
            })
            .catch((error) => {
              console.error("Error updating appointment:", error);
            });
        });
      });
    } else {
      alert("Please select a date and time.");
    }
  };
  
  return (
    <div className="appointment-widget"> 
      <AppointmentSelector/>
      <h2>Schedule an Appointment with {targetUser?.name}</h2>

      <div>
        <label>Select a Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={new Date()}
          inline
          filterDate={(date) => {
            if (!targetUser) return false;
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            return targetUser.availability.some((a: any) => a.date === formattedDate);
          }}
        />
      </div>

      {selectedDate && availableTimeSlots.length > 0 && (
        <div>
          <h3>Available Time Slots for {selectedDate.toLocaleDateString()}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {availableTimeSlots.map((slot: any) => (
              <button
                key={slot.time}
                onClick={() => handleTimeSelect(slot.time)}
                disabled={slot.isTaken}
                style={{
                  padding: "10px",
                  border: selectedTime === slot.time ? "2px solid blue" : "1px solid gray",
                  backgroundColor: slot.isTaken ? "#f5f5f5" : "white",
                  color: slot.isTaken ? "#a9a9a9" : "black",
                  cursor: slot.isTaken ? "not-allowed" : "pointer"
                }}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTime && (
        <div>
          <h4>Selected Time: {selectedTime}</h4>
        </div>
      )}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Confirm Appointment
      </button>
    </div>
  );
};

export default AppointmentWidget;
