import React from 'react';

interface TimeSlot {
  time: string;
  isTaken: boolean;
}

interface Availability {
  date: string;
  timeSlots: TimeSlot[];
}

interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  imageUrl: string;
  events: any[];
  availability: Availability[];
}

interface AppointmentSelectorProps {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  onUserSelect: (currentUser: User | null, selectedUser: User | null) => void;
}

const AppointmentSelector: React.FC<AppointmentSelectorProps> = ({
  users,
  currentUser,
  selectedUser,
  onUserSelect
}) => {
  const handleCurrentUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    const newCurrentUser = users.find(user => user._id === userId) || null;
    onUserSelect(newCurrentUser, selectedUser);
  };

  const handleSelectedUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    const newSelectedUser = users.find(user => user._id === userId) || null;
    onUserSelect(currentUser, newSelectedUser);
  };

  return (
    <div>
      <h2>Select Users for Appointment</h2>

      <div>
        <label htmlFor="currentUser">Logged-in User: </label>
        <select 
          id="currentUser" 
          value={currentUser?._id || ''} 
          onChange={handleCurrentUserChange}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="selectedUser">Make Appointment with: </label>
        <select 
          id="selectedUser" 
          value={selectedUser?._id || ''} 
          onChange={handleSelectedUserChange}
        >
          <option value="">Select a user</option>
          {users
            .filter((user) => user._id !== currentUser?._id)
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
        </select>
      </div>

      <div>
        {currentUser && (
          <p>
            <strong>Logged-in User:</strong> {currentUser.name}
          </p>
        )}
        {selectedUser && (
          <p>
            <strong>Appointment With:</strong> {selectedUser.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default AppointmentSelector;