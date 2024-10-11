// interfaces.ts

export interface TimeSlot {
    time: string;
    isTaken: boolean;
  }
  
  export interface Availability {
    date: string;
    timeSlots: TimeSlot[];
  }
  
  export interface Event {
    _id: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
  }
  
  export interface User {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    imageUrl: string;
    events: Event[];
    availability: Availability[];
  }
  
  export interface UserProfile {
    _id: string;
    googleId: string;
    imageUrl: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
  } 