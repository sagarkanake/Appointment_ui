import React, { useState , useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import axios from 'axios'; // Import axios for API requests
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

// Hardcoded appointment data
const initialEvents = [
  {
    id: 1,
    title: 'Dental Checkup',
    start: new Date(2024, 9, 3, 9, 0), // October 3, 2024, 9:00 AM
    end: new Date(2024, 9, 3, 10, 0),  // October 3, 2024, 10:00 AM
  },
  {
    id: 2,
    title: 'Teeth Cleaning',
    start: new Date(2024, 9, 4, 14, 0), // October 4, 2024, 2:00 PM
    end: new Date(2024, 9, 4, 15, 0),   // October 4, 2024, 3:00 PM
  },
  {
    id: 3,
    title: 'Root Canal',
    start: new Date(2024, 9, 5, 11, 0), // October 5, 2024, 11:00 AM
    end: new Date(2024, 9, 5, 12, 30),  // October 5, 2024, 12:30 PM
  },
];

function WeeklyCalendar() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetchAppointments();
  }, []);
  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments');
      const data = await response.json();
      
      // Map the data to include 'id' instead of '_id'
      const mappedData = data.map(appointment => ({
        id: appointment._id, // Use the _id from the response
        title: appointment.title,
        start: new Date(appointment.start), // Ensure to convert to Date object if needed
        end: new Date(appointment.end), // Ensure to convert to Date object if needed
      }));
  
      setEvents(mappedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  console.log(' events ' , events)
  const handleSelectSlot = async ({ start, end }) => {
    const title = window.prompt('Enter appointment title:'); // Get title from user
    if (title) {
      // Create a new event object
      const newEvent = {
        title,
        start,
        end,
      };
  
      try {
        // API call to add the appointment
        const response = await axios.post('http://localhost:5000/api/appointments', newEvent);
        
        // Use response.data._id to set the new event's ID
        setEvents([...events, { id: response.data._id, ...newEvent }]); // Add new event to state
      } catch (error) {
        console.error('Error adding appointment:', error); // Handle error
      }
    }
  };
  const handleEventDrop = async ({ event, start, end }) => {
    const updatedEvent = {
      title: event.title,
      start : end,
      end,
    };
  
    try {
      // Make an API call to update the appointment in the database
      await axios.put(`http://localhost:5000/api/appointments/${event.id}`, updatedEvent);
  
      // Update the local state with the new event data
      const updatedEvents = events.map(e =>
        e.id === event.id ? { ...e,  start : end , end } : e
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error updating appointment:', error); // Handle error
    }
  };
  const handleResizeEvent = async ({ event, start, end }) => {
    const updatedEvent = {
      title: event.title,
      start,
      end,
    };
  
    try {
      // Make an API call to update the appointment in the database
      await axios.put(`http://localhost:5000/api/appointments/${event.id}`, updatedEvent);
  
      // Update the local state with the new event data
      const updatedEvents = events.map(e =>
        e.id === event.id ? { ...e, start, end } : e
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error updating appointment:', error); // Handle error
    }
  };
  // const handleEventDrop = ({ event, start, end }) => {
  //   const updatedEvents = events.map(e => 
  //     e.id === event.id ? { ...e, start, end } : e
  //   );
  //   setEvents(updatedEvents);
  // };

  // const handleResizeEvent = ({ event, start, end }) => {
  //   const updatedEvents = events.map(e => 
  //     e.id === event.id ? { ...e, start, end } : e
  //   );
  //   setEvents(updatedEvents);
  // };
  const handleDeleteEvent = async (eventToDelete) => {
    try {
      // Make an API call to delete the appointment from the database
      await axios.delete(`http://localhost:5000/api/appointments/${eventToDelete.id}`);
      
      // Update the local state to remove the deleted event
      const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error deleting appointment:', error); // Handle error
    }
  };

  const EventComponent = ({ event }) => (
    <div>
      <strong>{event.title}</strong>
      <button onClick={() => handleDeleteEvent(event)} style={{ marginLeft: '5px' }}>x</button>
    </div>
  );

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <h1>Weekly Appointment Calendar</h1>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 80px)' }}
        defaultView="week"
        selectable
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleResizeEvent}
        resizable
        components={{
          event: EventComponent,
        }}
      />
    </div>
  );
}

export default WeeklyCalendar