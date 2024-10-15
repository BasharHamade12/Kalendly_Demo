import React, { useState } from 'react';
import { Box, Heading, Text, Image, Flex, useColorModeValue, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Input ,useColorMode,VStack,useClipboard,InputGroup,InputRightElement} from '@chakra-ui/react';
import AppointmentWidget from './AppointmentWidget';
import Login from './components/Login';
import Logout from './components/Logout';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';
import { useUserStore } from './store';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useLocation,useNavigate } from 'react-router-dom';
import CreateEvent from './components/CreateEvent';

const clientId = '468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com';

function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode} mt={4}>
      Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
    </Button>
  );
}

function ShareLinkModal({ isOpen, onClose, link }) {
  const { hasCopied, onCopy } = useClipboard(link);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Share this event</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text mb={2}>Copy this link to share the event:</Text>
          <InputGroup size="md">
            <Input pr="4.5rem" value={link} isReadOnly />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={onCopy}>
                {hasCopied ? "Copied!" : "Copy"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Layout() {
  const { user, setUser } = useUserStore();
  const [message, setMessage] = useState<any>(null);
  const [events, setEvents] = useState<any>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareLink, setShareLink] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: '',
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        if (user) {
          const response = await axios.get(`http://localhost:3000/api/events/user/${user._id}`);
          setEvents(response.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (user) {
      fetchUserEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  const handleLoginSuccess = async (response: any) => {
    if ('profileObj' in response) {
      const user_response = await axios.get(`http://localhost:3000/api/users/google/${response.profileObj.googleId}`);
      setUser(user_response.data);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessage(null);
  };

  const handleShare = (event) => {
    const link = `${window.location.origin}/${user.name}/${event.title}`;
    setShareLink(link);
    onOpen();
  };

  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'purple.100');

  return (
    <Box p={6} bg={bgColor} minHeight="100vh" color={textColor}>
      <ColorModeSwitcher />
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

<Flex direction="row" align="stretch" p={4} wrap="wrap">
        {events && events.map((event, index) => (
          <Box
            key={index}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            m={2}
            w="300px"
            h="300px"
            boxShadow="md"
            display="flex"
            flexDirection="column"
          >
            <VStack align="stretch" flex="1">
              <Heading as="h3" size="md" mb={2}>{event.title}</Heading>
              <Text mb={2} flex="1" overflow="hidden">{event.description}</Text>
              <Text color="gray.500" mb={4}>{event.duration}</Text>
            </VStack>
            <Button colorScheme="blue" onClick={() => handleShare(event)} mt="auto">
              Share Event
            </Button>
          </Box> 
        ))} 
        {user && <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          p={4}
          m={2}
          w="300px"
          h="300px"
          boxShadow="md"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Button colorScheme="green" onClick={() => navigate('/createEvent')} size="lg">
            +
          </Button>
        </Box>}
        
      </Flex>

      <ShareLinkModal isOpen={isOpen} onClose={onClose} link={shareLink} />

      {message && (
        <Box mb={6} textAlign="center">
          <Text color="teal.500" fontSize="lg">{message}</Text>
        </Box>
      )}
    </Box>
  );
}

function App() {
  const location = useLocation();
  const isAppointmentPage = location.pathname.startsWith('/appointment');
  const { user, setUser } = useUserStore(); 

  
  return (
    <Box p={6}>
      <Routes>
        <Route path="/:creatorName/:eventName" element={<AppointmentWidget />} /> 
        {user && <Route path="/createEvent" element={<CreateEvent />} />}
        {!isAppointmentPage && (
          <Route path="/*" element={<Layout />} />
        )}
      </Routes>
    </Box>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}