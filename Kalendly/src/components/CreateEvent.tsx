import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Heading, HStack, IconButton, useFormControlProps } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [availableDays, setAvailableDays] = useState([{ date: new Date(), timeSlots: [{ startTime: '09:00' }] }]);
  const { user } = useUserStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleAddDay = () => {
    setAvailableDays([...availableDays, { date: new Date(), timeSlots: [{ startTime: '09:00' }] }]);
  };

  const handleRemoveDay = (index: number) => {
    const newDays = availableDays.filter((_, i) => i !== index);
    setAvailableDays(newDays);
  };

  const handleAddTimeSlot = (dayIndex: number) => {
    const newDays = [...availableDays];
    newDays[dayIndex].timeSlots.push({ startTime: '09:00' });
    setAvailableDays(newDays);
  };

  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newDays = [...availableDays];
    newDays[dayIndex].timeSlots = newDays[dayIndex].timeSlots.filter((_, i) => i !== slotIndex);
    setAvailableDays(newDays);
  };

  const handleDateChange : any = (date: Date, dayIndex: number) => {
    const newDays = [...availableDays];
    newDays[dayIndex].date = date;
    setAvailableDays(newDays);
  };

  const handleTimeChange = (time: string, dayIndex: number, slotIndex: number) => {
    const newDays = [...availableDays];
    newDays[dayIndex].timeSlots[slotIndex].startTime = time;
    setAvailableDays(newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create an event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/events', {
        creator: user._id,
        title,
        description,
        duration,
        availableDays: availableDays.map(day => ({
          date: day.date,
          timeSlots: day.timeSlots.map(slot => ({
            startTime: slot.startTime,
            isAvailable: true
          }))
        }))
      });
      
      console.log(response)
      const requestBody = {
        creator: user._id,
        title,
        description,
        duration,
        availableDays: availableDays.map(day => ({
          date: day.date,
          timeSlots: day.timeSlots.map(slot => ({
            startTime: slot.startTime,
            isAvailable: true
          }))
        }))
      };
      
      console.log(requestBody);
      
      

      toast({
        title: 'Event created',
        description: 'Your event has been successfully created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      //navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Heading size="lg">Create New Event</Heading>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Duration (minutes)</FormLabel>
            <NumberInput min={15} max={240} value={duration} onChange={(valueString) => setDuration(Number(valueString))}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <HStack spacing={4} align="stretch">
            {availableDays.map((day, dayIndex) => (
              <Box key={dayIndex} borderWidth={1} borderRadius="md" p={4}>
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm">Day {dayIndex + 1}</Heading>
                  <IconButton aria-label="Remove day" icon={<DeleteIcon />} onClick={() => handleRemoveDay(dayIndex)} size="sm" />
                </HStack>
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <DatePicker
                    selected={day.date}
                    onChange={(date: any) => handleDateChange(date, dayIndex)}
                    dateFormat="MMMM d, yyyy"
                    customInput={<Input />}
                  />
                </FormControl>
                <HStack spacing={2} mt={2}>
                  {day.timeSlots.map((slot, slotIndex) => (
                    <HStack key={slotIndex}>
                      <FormControl isRequired>
                        <FormLabel>Start Time</FormLabel>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeChange(e.target.value, dayIndex, slotIndex)}
                        />
                      </FormControl>
                      <IconButton aria-label="Remove time slot" icon={<DeleteIcon />} onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)} size="sm" alignSelf="flex-end" />
                    </HStack>
                  ))}
                </HStack>
                <Button leftIcon={<AddIcon />} onClick={() => handleAddTimeSlot(dayIndex)} size="sm" mt={2}>
                  Add Time Slot
                </Button>
              </Box>
            ))}
          </HStack>
          <Button leftIcon={<AddIcon />} onClick={handleAddDay} colorScheme="teal">
            Add Day
          </Button>
          <Button type="submit" colorScheme="blue">Create Event</Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateEvent;