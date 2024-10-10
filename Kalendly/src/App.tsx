import './App.css'
import AppointmentWidget from './AppointmentWidget'
import Login from './components/Login'
import Logout from './components/Logout'
import { useState, useEffect } from 'react'
import { gapi } from 'gapi-script'
import CreateEvent from './components/CreateEvent' 
import './AppointmentWidget.css'

const clientId = "468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com"

interface UserProfile {
  _id: string; // Add the database _id
  googleId: string;
  imageUrl: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
}


function App() {
  const [user, setUser] = useState<UserProfile | null>(null);  // UserProfile type or null
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: ''
      });
    }

    gapi.load("client:auth2", start);
  }, []);
  useEffect(() => {
    console.log(user)
  }, [user]); 


  const handleLoginSuccess = async (response: any) => {
    if ('profileObj' in response) {
      const { googleId, email, name, imageUrl } = response.profileObj;
      
      try {
        const res = await fetch('http://localhost:3000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ googleId, email, name, imageUrl }),
        });
  
        const data = await res.json();
        console.log(data);
  
        // Save the user in the state, including the _id from the database
        if (res.status === 200 || res.status === 201) {
          const { _id, googleId, email, name, imageUrl , givenName, familyName } = data.user;
          setUser({ _id, googleId, imageUrl , email, name, givenName, familyName }); // Include _id in the state
        }
  
        // Set message based on status
        if (res.status === 201) {
          setMessage(`New user created: ${name}`);
        } else if (res.status === 200) {
          setMessage(`Welcome back, ${name}!`);
        } else {
          setMessage('Error during authentication.');
        }
      } catch (error) {
        console.error('Error saving user data:', error);
        setMessage('Error connecting to the server.');
      }
    }
  };
  

  const handleLoginFailure = (error: any) => {
    console.error('Login failed:', error);
    setMessage('Login failed. Please try again.');
  };

  const handleLogout = () => {
    setUser(null);  // Clear user state on logout
    setMessage(null);  // Clear message on logout
    console.log('User logged out');
  };

  return (
    <>
      <Login onLoginSuccess={handleLoginSuccess} />
      <Logout onLogout={handleLogout} /> 
      {user && <CreateEvent user = {user} />} 
       {/* Show user info if logged in */}
       {user && (
        <div>
          <h2>Welcome, {user.name}</h2>
          <p>Email: {user.email}</p>
          <img src={user.imageUrl} alt="Profile" />
        </div>
      )}

      {/* Show message */}
      {message && <p>{message}</p>}
      <AppointmentWidget />
      
     
    </>
  )
}

export default App;
