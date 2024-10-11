import { Box, Heading, Text, Image, Flex, useColorModeValue } from '@chakra-ui/react';
import AppointmentWidget from './AppointmentWidget';
import Login from './components/Login';
import Logout from './components/Logout';
import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import CreateEvent from './components/CreateEvent'; 
import { UserProfile } from './models';

const clientId = '468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com';


import { Button, useColorMode } from '@chakra-ui/react';

function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode} mt={4}>
      Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
    </Button>
  );
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: ''
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  useEffect(() => {
    console.log(user);
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

        if (res.status === 200 || res.status === 201) {
          const { _id, googleId, email, name, imageUrl, givenName, familyName } = data.user;
          setUser({ _id, googleId, imageUrl, email, name, givenName, familyName });
        }

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
    setUser(null);
    setMessage(null);
    console.log('User logged out');
  };

  // Use `useColorModeValue` to adapt colors to dark or light modes with a darker violet vibe
  const bgColor = useColorModeValue('gray.100', 'gray.900'); // Light mode bg: gray.100, Dark mode bg: purple.900
  const textColor = useColorModeValue('gray.800', 'purple.100'); // Light mode text: gray.800, Dark mode text: purple.100

  return (
    <Box p={6} bg={bgColor} minHeight="100vh" color={textColor}>
      {/* Display login or logout buttons */} 
      {ColorModeSwitcher()}
      <Flex justify="space-between" align="center" mb={6}>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Logout onLogout={handleLogout} />
      </Flex>

      {/* Show user info if logged in */}
      {user && (
        <Box textAlign="center" mb={6}>
          <Heading size="lg" mb={4}>
            Welcome, {user.name}
          </Heading>
          <Text>Email: {user.email}</Text>
          <Image
            src={user.imageUrl}
            alt="Profile"
            borderRadius="full"
            boxSize="100px"
            mt={4}
            mx="auto"
          />
        </Box>
      )}

      {/* Show message */}
      {message && (
        <Box mb={6} textAlign="center">
          <Text color="teal.500" fontSize="lg">
            {message}
          </Text>
        </Box>
      )}

      {/* Display AppointmentWidget and CreateEvent */}
      {user && <CreateEvent user={user} />}
      <AppointmentWidget />
    </Box>
  );
}

export default App;
