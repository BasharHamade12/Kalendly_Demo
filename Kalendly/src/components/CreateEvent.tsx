import React, { useState } from 'react';

interface UserProfile { 
 _id : string;
  googleId: string;
  imageUrl: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
}

interface CreateEventProps {
  user: UserProfile | null;
} 



interface ITimeSlot {
  startTime: string;
  
  isAvailable?: boolean; // Optional because there's a default value
  bookedBy?: string | null; // Optional and can be null
}

interface IAvailableDay {
  date: string;
  timeSlots: ITimeSlot[]; // Array of time slots
}


const CreateEvent: React.FC<CreateEventProps> = ({ user }) => { 


  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();  
    let availableTimeSlot : ITimeSlot = { startTime : time , isAvailable : true , bookedBy : null }
    let availableDay : IAvailableDay = {
        date: date , 
        timeSlots : [availableTimeSlot]
    } 
    let availableDays = [availableDay]
   

    // Check if user is logged in
    if (!user) {
      setMessage("You must be logged in to create an event.");
      return;
    }
    const creator = user._id
    // Create event object
    const newEvent = { 
      creator,
      title, 
      description, 
      availableDays,
      duration : 60
      }

    try {
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Event created successfully: ${data.title}`);
        
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage('Error connecting to the server.');
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Time:</label>
          <input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Create Event</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateEvent;