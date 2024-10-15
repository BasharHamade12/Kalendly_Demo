import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { gapi } from "gapi-script";
import AppointmentSelector from "./AppointmentSelector"; 
import Calendar  from "react-calendar";
//import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import MonthlyCalendar from "./components/MonthlyCalendar";
import {User,TimeSlot,Availability,Event} from "./models.ts"

import { useParams } from 'react-router-dom';




const AppointmentWidget: React.FC = () => { 


  const { creatorName, eventName } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedUserEvent, setSelectedUserEvent] = useState<Event>(); 
  const [selectedUserDays, setSelectedUserDays] = useState<Event[]>([]); 



  useEffect ( () => {
    console.log(JSON.stringify(selectedUserEvent)) 
    
  },[selectedUserEvent])

  useEffect(() => {
    // Initialize Google Calendar API 
    console.log(creatorName,eventName) 

    const initClient = () => {
      gapi.client.init({
        apiKey: "AIzaSyAaFpEqYP-N0h2dm1ZwAmO6EFwlF7kQW5M",
        clientId: "468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.events",
      });
    };

    gapi.load("client:auth2", initClient);
    fetchEvent(eventName,creatorName);
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

  const fetchEvent = async (eventName : any, creatorName : any) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/eventlink/${(eventName)}/${(creatorName)}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json(); 
      console.log(data)
      setSelectedUserEvent(data) 
      setSelectedUserDays(data.availableDays)
      return data;
    } catch (error) {
      console.log('Error fetching event:', error);
      
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
        console.log(events)
        // Convert string dates to Date objects
        const processedEvents = events.map((event: Event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setSelectedUserEvent(processedEvents[1]);  
        
        setSelectedUserDays(processedEvents[1].availableDays)
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    }
  };



  return (
    <div className="appointment-widget">
     <h1><pre>Event: {selectedUserEvent?.title}</pre></h1>
    {
      //<Calendar onChange={onChange} value={date} />
    }
    {(
      <>
        
        <MonthlyCalendar event = {selectedUserEvent} days = {selectedUserDays} />
        <pre>
          {/*selectedUserDays.map((day, index) => (
            <div key={index}>{JSON.stringify(day.date)}</div>
          ))*/}
        </pre>
       
      </>
    )}

    
    </div>
  );
};

export default AppointmentWidget;




//Sojamilch!1