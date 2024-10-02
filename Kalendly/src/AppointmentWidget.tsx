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

interface Event {
  _id: string;
  title: string;
  description: string;
  start: string;
  end: string;
}

interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  imageUrl: string;
  events: Event[];
  availability: Availability[];
}

const AppointmentWidget: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedUserEvents, setSelectedUserEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Initialize Google Calendar API
    const initClient = () => {
      gapi.client.init({
        apiKey: "AIzaSyAaFpEqYP-N0h2dm1ZwAmO6EFwlF7kQW5M",
        clientId: "468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.events",
      });
    };

    gapi.load("client:auth2", initClient);

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserSelect = async (current: User | null, selected: User | null) => {
    setCurrentUser(current);
    setSelectedUser(selected);
    setSelectedDate(null);
    setAvailableTimeSlots([]);
    setSelectedTime(null);

    if (selected) {
      try {
        const response = await fetch(`http://localhost:3000/api/events/user/${selected._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        setSelectedUserEvents(events);
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);

    if (date && selectedUser) {
      const selectedDateString = date.toISOString().split("T")[0];
      const availability = selectedUser.availability?.find(
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && currentUser && selectedUser) {
      const event = {
        summary: `Appointment with ${selectedUser.name}`,
        location: "Online",
        description: `${currentUser.name} appointment scheduled with ${selectedUser.name}.`,
        start: {
          dateTime: `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`,
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`,
          timeZone: "America/Los_Angeles",
        },
        attendees: [
          { email: currentUser.email },
          { email: selectedUser.email }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      try {
        await gapi.auth2.getAuthInstance().signIn();
        const request = gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        const response = await request.execute();
        console.log("Event created: ", response.htmlLink);
        alert(`Appointment confirmed and added to Google Calendar. Event Link: ${response.htmlLink}`);

        // Update local state
        if (availableTimeSlots) {
          const updatedTimeSlots = availableTimeSlots.map((slot) =>
            slot.time === selectedTime ? { ...slot, isTaken: true } : slot
          );
          setAvailableTimeSlots(updatedTimeSlots);
        }

        // Here you would typically also update the backend
        // await updateAppointmentBackend(selectedUser._id, selectedDate, selectedTime);
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
      }
    } else {
      alert("Please select a date and time.");
    }
  };

  const highlightWithEvents = (date: Date) => {
    return selectedUserEvents.some(event => 
      new Date(event.start).toDateString() === date.toDateString()
    );
  };

  return (
    <div className="appointment-widget">
      <AppointmentSelector 
        users={users}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onUserSelect={handleUserSelect}
      />
      
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
              highlightDates={selectedUserEvents.map(event => new Date(event.start))}
              dayClassName={(date: Date) =>
                highlightWithEvents(date) ? "highlight" : ""
              }
              filterDate={(date: Date) => {
                const formattedDate = date.toISOString().split("T")[0];
                return selectedUser.availability?.some((a) => a.date === formattedDate) || false;
              }}
            />
          </div>

          {selectedDate && (
            <div>
              <h3>Events on {selectedDate.toLocaleDateString()}</h3>
              {selectedUserEvents
                .filter(event => new Date(event.start).toDateString() === selectedDate.toDateString())
                .map(event => (
                  <div key={event._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                    <strong>{event.title}</strong><br />
                    {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}<br />
                    {event.description}
                  </div>
                ))
              }
            </div>
          )}

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
            disabled={!selectedDate || !selectedTime}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: (!selectedDate || !selectedTime) ? "#cccccc" : "#007bff",
              color: "white",
              border: "none",
              cursor: (!selectedDate || !selectedTime) ? "not-allowed" : "pointer",
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