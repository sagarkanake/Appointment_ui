import React, { useState , useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import axios from 'axios'; // Import axios for API requests
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);


function WeeklyCalendar({ events , setEvents   }) {
 
  const handleSelectSlot = async ({ start, end }) => {
    const title = window.prompt('Enter appointment title:'); // Get title from user
    console.log( ' start ', start , ' end ', end )
    if (title) {
      // Create a new event object
      const newEvent = {
        title,
        start,
        end : start,
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
      start,
      end,
    };
  
    try {
      // Make an API call to update the appointment in the database
      await axios.put(`http://localhost:5000/api/appointments/${event.id}`, updatedEvent);
  
      // // Update the local state with the new event data
      const updatedEvents = events.map(e =>
        e.id === event.id ? { ...e,  start , end } : e
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
  const eventItemStyles = {
    container: {
      position: 'relative',
      padding: '8px',
      paddingRight: '40px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      wordBreak: 'break-word',
      width: '100%',
      cursor: 'pointer',
    },
    button: {
      position: 'absolute',
      top: '50%',
      right: '8px',
      transform: 'translateY(-50%)',
      padding: '4px 8px',
      fontSize: '14px',
      color: '#dc2626',
      backgroundColor: '#fee2e2',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    tooltipWrapper: {
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '10px',
      visibility: 'hidden',
      opacity: 0,
      transition: 'opacity 0.2s, visibility 0.3s',
      zIndex: 1000,
    },
    tooltip: {
      backgroundColor: '#333',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      maxWidth: '250px',
      wordWrap: 'break-word',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      position: 'relative',
    },
    arrow: {
      position: 'absolute',
      bottom: '-6px',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      width: '12px',
      height: '12px',
      backgroundColor: '#333',
    },
  };

  const EventComponent = ({ event }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div style={eventItemStyles.container}>
      <strong 
        style={eventItemStyles.title}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {event.title}
      </strong>
      <div 
        style={{
          ...eventItemStyles.tooltipWrapper,
          visibility: showTooltip ? 'visible' : 'hidden',
          opacity: showTooltip ? 1 : 0,
        }}
      >
        <div style={eventItemStyles.tooltip}>
          {event.title}
          <div style={eventItemStyles.arrow}></div>
        </div>
      </div>
      <button 
        onClick={() => handleDeleteEvent(event)}
        style={eventItemStyles.button}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
      >
        x
      </button>
    </div>
    );
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)' }}>
      <h1>Weekly Appointment Calendar</h1>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 50px)' }}
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