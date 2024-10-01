import React, { useState } from 'react';
import usersData from '../../Server/users.json';

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

interface AppointmentSelectorProps {
  onUserSelect: (currentUser: User | null, selectedUser: User | null) => void;
}

const AppointmentSelector: React.FC<AppointmentSelectorProps> = ({ onUserSelect }) => {
  const users: User[] = usersData.users;

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleCurrentUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(event.target.value);
    setCurrentUserId(userId);
    const currentUser = users.find(user => user.id === userId) || null;
    const selectedUser = users.find(user => user.id === selectedUserId) || null;
    onUserSelect(currentUser, selectedUser);
  };

  const handleSelectedUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(event.target.value);
    setSelectedUserId(userId);
    const currentUser = users.find(user => user.id === currentUserId) || null;
    const selectedUser = users.find(user => user.id === userId) || null;
    onUserSelect(currentUser, selectedUser);
  };

  return (
    <div>
      <h2>Select Users for Appointment</h2>

      <label htmlFor="currentUser">Logged-in User: </label>
      <select id="currentUser" value={currentUserId ?? ''} onChange={handleCurrentUserChange}>
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <label htmlFor="selectedUser">Make Appointment with: </label>
      <select id="selectedUser" value={selectedUserId ?? ''} onChange={handleSelectedUserChange}>
        <option value="">Select a user</option>
        {users
          .filter((user) => user.id !== currentUserId)
          .map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
      </select>

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