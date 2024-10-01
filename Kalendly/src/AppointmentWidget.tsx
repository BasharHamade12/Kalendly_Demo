import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { gapi } from "gapi-script";
import AppointmentSelector from "./AppointmentSelector";

interface TimeSlot {
  time: string;
  isTaken: boolean;
}

interface Availability {
  date: string;
  timeSlots: TimeSlot[];
}

interface User {
  id: number;
  name: string;
  availability: Availability[];
}

const AppointmentWidget: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Google Calendar API
    const initClient = () => {
      gapi.client.init({
        apiKey: "AIzaSyAaFpEqYP-N0h2dm1ZwAmO6EFwlF7kQW5M", // Replace with your API Key
        clientId: "468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com", // Replace with your Client ID,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.events",
      });
    };

    gapi.load("client:auth2", initClient);
  }, []);

  const handleUserSelect = (current: User | null, selected: User | null) => {
    setCurrentUser(current);
    setSelectedUser(selected);
    setSelectedDate(null);
    setAvailableTimeSlots([]);
    setSelectedTime(null);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);

    if (date && selectedUser) {
      const selectedDateString = date.toISOString().split("T")[0];
      const availability = selectedUser.availability.find(
        (a) => a.date === selectedDateString
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
    if (selectedDate && selectedTime && currentUser && selectedUser) {
      const event = {
        summary: `Appointment with ${selectedUser.name}`,
        location: "Online",
        description: `${currentUser.name } : Appointment scheduled with ${selectedUser.name}.`,
        start: {
          dateTime: new Date(selectedDate.getTime()).toISOString(),
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: "America/Los_Angeles",
        },
        attendees: [{ email: "example@example.com" }],
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

          // Update local state
          const updatedTimeSlots = availableTimeSlots.map((slot) =>
            slot.time === selectedTime ? { ...slot, isTaken: true } : slot
          );

          setAvailableTimeSlots(updatedTimeSlots);

          // Call backend to update JSON file (implement this part)
          // updateAppointmentBackend(selectedUser.id, selectedDate, selectedTime);
        });
      });
    } else {
      alert("Please select a date and time.");
    }
  };

  return (
    <div className="appointment-widget">
      <AppointmentSelector onUserSelect={handleUserSelect} />
      
      {selectedUser && (
        <>
          <h2>Schedule an Appointment with {selectedUser.name}</h2>

          <div>
            <label>Select a Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              inline
              filterDate={(date) => {
                const formattedDate = date.toISOString().split("T")[0];
                return selectedUser.availability.some((a) => a.date === formattedDate);
              }}
            />
          </div>

          {selectedDate && availableTimeSlots.length > 0 && (
            <div>
              <h3>Available Time Slots for {selectedDate.toLocaleDateString()}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {availableTimeSlots.map((slot) => (
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
        </>
      )}
    </div>
  );
};

export default AppointmentWidget;