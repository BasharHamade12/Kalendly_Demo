import React from 'react';
import { GoogleLogout } from 'react-google-login';

interface LogoutProps {
  onLogout: () => void;  // Logout function passed as a prop
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
  const clientId = "468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com"; // Replace with your actual client ID

  return (
    <div id="clientIdButton">
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onLogoutSuccess={onLogout}  // Use the onLogout prop
      />
    </div>
  );
};

export default Logout;
