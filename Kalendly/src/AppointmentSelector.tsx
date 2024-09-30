import React, { useState } from 'react';
import usersData from '../../Server/users.json'; // Adjust the path accordingly

// Type definitions
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

const AppointmentSelector: React.FC = () => {
  const users: User[] = usersData.users;

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Handle selection changes
  const handleCurrentUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentUserId(Number(event.target.value));
  };

  const handleSelectedUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(Number(event.target.value));
  };

  return (
    <div>
      <h2>Select Users for Appointment</h2>

      {/* Dropdown to select current logged-in user */}
      <label htmlFor="currentUser">Logged-in User: </label>
      <select id="currentUser" value={currentUserId ?? ''} onChange={handleCurrentUserChange}>
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {/* Dropdown to select user to make an appointment with */}
      <label htmlFor="selectedUser">Make Appointment with: </label>
      <select id="selectedUser" value={selectedUserId ?? ''} onChange={handleSelectedUserChange}>
        <option value="">Select a user</option>
        {users
          .filter((user) => user.id !== currentUserId) // Exclude current user
          .map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
      </select>

      {/* Display selected users */}
      <div>
        {currentUserId && (
          <p>
            <strong>Logged-in User:</strong>{' '}
            {users.find((user) => user.id === currentUserId)?.name}
          </p>
        )}
        {selectedUserId && (
          <p>
            <strong>Appointment With:</strong>{' '}
            {users.find((user) => user.id === selectedUserId)?.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default AppointmentSelector;
