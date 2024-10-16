import React, { useState } from 'react';
import './MonthlyCalendar.css';
import { json } from 'react-router-dom';

interface MonthlyCalendarProps {
  event: any;
  days: any;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ event, days }) => {
  const initialYear = new Date().getFullYear();
  const initialMonth = new Date().getMonth();
  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
  const [timeSlots, settimeSlots] = useState<any>([]);

  const [selectedDay, setselectedDay] = useState<any>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, () => null);

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11; // December
      }
      return prevMonth - 1;
    });
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0; // January
      }
      return prevMonth + 1;
    });
  };

  // Check if a given day should be highlighted
  const shouldHighlightDay = (day: number) => {
    const currentDate = new Date(currentYear, currentMonth, day);
    return days.some((dayObj) => isSameDay(new Date(dayObj.date), currentDate));
  };

  const handleDayClick = (day: number) => {
    // Create the clicked date in local format (YYYY-MM-DD)
    const clickedDate = new Date(currentYear, currentMonth, day).toLocaleDateString('en-CA');
  
    // Find the matching day in the 'days' array (ignore time by using local date format)
    const matchingDay = days.find((dayObj) => {
      const dayDate = new Date(dayObj.date).toLocaleDateString('en-CA');
      return dayDate === clickedDate;
    });
  
    if (matchingDay) {
      console.log(`Matching day found:`, matchingDay);
      //alert(`You clicked on ${clickedDate}, matching day: ${JSON.stringify(matchingDay)}`);
      // Additional logic for the matched day can go here 
      settimeSlots(matchingDay.timeSlots) 
      setselectedDay(matchingDay)
    } else {
      console.log(`No matching day found for ${clickedDate}`);
      alert(`You clicked on ${clickedDate}, but no matching day was found.`);
    }
  }; 

  const handleTimeClick = async (time: any) => {
    alert(time.startTime)  
    let target_id = time._id;
    console.log(target_id)
    console.log(event._id,selectedDay) 
    console.log(selectedDay)
    try {
        const response = await fetch(`http://localhost:3000/api/events/${event._id}/book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: selectedDay,
            startTime: time.startTime, 
            userId : "anond"
          }),
        });  
        console.log(response) 
        settimeSlots(prevArray => {
          console.log("Previous Array:", prevArray);
          const updatedArray = prevArray.map(element => {
            console.log("Checking element:", element); 
            console.log("target id", target_id) 
            //console.log("target id", target_id === element)
            if (element._id === target_id) {
              console.log("Match found, updating element:", element);
              return { ...element, isAvailable: false };
            }
            return element;
          });
          console.log("Updated Array:", updatedArray);
          return updatedArray;
        });
        
    } catch (err) { 

        console.log("the error" , err)
    }

  }
  
  

  return ( 
    <>
    <div className="calendar"> 
      
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>&lt;</button>
        <h2>
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
          })}{' '}
          {currentYear}
        </h2>
        <button onClick={goToNextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div className="calendar-header" key={day}>
            {day}
          </div>
        ))}
        {blankDays.map((_, idx) => (
          <div key={`blank-${idx}`} className="calendar-day empty"></div>
        ))}
        {daysArray.map((day) => (
          <div
            key={day}
            className={`calendar-day ${shouldHighlightDay(day) ? 'highlight' : ''}`}
            onClick={() => {
                if (shouldHighlightDay(day)) {
                  handleDayClick(day);
                } else {
                  // Replace 'setCertainState' with your actual state-setting function
                  settimeSlots([]);
                }
              }}// Attach click handler
          >
            {day}
          </div>
        ))} 

      </div>
    </div> 

    <div>
      {timeSlots.length > 0 && (
        <ul>
          {timeSlots.map((slot, index) => ( 
            <li key={index}>
              <button
                onClick={() => {
                  if (!slot.isBooked) {
                    handleTimeClick(slot) 
                  }
                }}
                disabled={!slot.isAvailable}
                style={{
                  backgroundColor: !slot.isAvailable ? '#d3d3d3' : '#4CAF50', // Booked: grey, Available: green
                  cursor: !slot.isAvailable ? 'not-allowed' : 'pointer', // Change cursor for booked slots
                  color: '#fff',
                  padding: '10px',
                  margin: '5px',
                  border: 'none',
                  borderRadius: '5px'
                }}
              > 
                {console.log(JSON.stringify(slot.isAvailable))}
                {slot.startTime}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

    </>
  );
};

export default MonthlyCalendar;
