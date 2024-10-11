import { Box, Heading, Text, Image, Flex, useColorModeValue } from '@chakra-ui/react';
import AppointmentWidget from './AppointmentWidget';
import Login from './components/Login';
import Logout from './components/Logout';
import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import CreateEvent from './components/CreateEvent'; 
import { UserProfile } from './models'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useUserStore } from './store';


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
  //const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<any>(null); 

  const { user, setUser } = useUserStore();


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
      // Existing login logic 
      console.log(response.profileObj) 
      setUser(response.profileObj)
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

  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'purple.100');

  return (
    <Router>
      <Box p={6} bg={bgColor} minHeight="100vh" color={textColor}>
        {ColorModeSwitcher()}
        <Flex justify="space-between" align="center" mb={6}>
          <Login onLoginSuccess={handleLoginSuccess} />
          <Logout onLogout={handleLogout} />
        </Flex>

        {user && (
          <Box textAlign="center" mb={6}>
            <Heading size="lg" mb={4}>Welcome, {user.name}</Heading>
            <Text>Email: {user.email}</Text>
            <Image src={user.imageUrl} alt="Profile" borderRadius="full" boxSize="100px" mt={4} mx="auto" />
          </Box>
        )}

        {message && (
          <Box mb={6} textAlign="center">
            <Text color="teal.500" fontSize="lg">{message}</Text>
          </Box>
        )}

        <Routes>
          {/* Define the route for AppointmentWidget */}
          <Route path="/appointment/:creatorName/:eventName" element={<AppointmentWidget />} />

          
          {/* You can define other routes here */}
          <Route path="/" element={user ? <CreateEvent user={user} /> : <Text>Welcome! Please log in.</Text>} />
        </Routes>
      </Box>
    </Router>
  );
}


export default App;
