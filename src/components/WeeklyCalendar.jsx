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
  const base_url = import.meta.env.VITE_API_BASE_URL
  const [isLoading, setIsLoading] = useState(false);
  const handleSelectSlot = async ({ start, end }) => {
    console.log( ' checked ',  typeof start, end , new Date( start.setTime(start.getTime() + (12 * 60 * 60 * 1000))  ),  new Date( start.setTime(start.getTime() + (12 * 60 * 60 * 1000))  )  )
    const title = window.prompt('Enter appointment title:');
    if (title) {
      setIsLoading(true);
      const newEvent = {
        title,
        start : new Date( start.setTime(start.getTime() + (13 * 60 * 60 * 1000)) ),
        end : new Date(end.setTime(end.getTime() + (14 * 60 * 60 * 1000)) ),
      };

      console.log( 'newEvent ' , newEvent )

      const tempId = 'temp_' + new Date().getTime();
      setEvents(prevEvents => [...prevEvents, { id: tempId, ...newEvent }]);

      try {
        const response = await axios.post(`${base_url}/api/appointments`, newEvent);
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === tempId ? { ...event, id: response.data._id } : event
          )
        );
      } catch (error) {
        console.error('Error adding appointment:', error);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== tempId));
        alert('Failed to add the appointment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    setIsLoading(true);
    
    // Store the original event data
    const originalEvent = { ...event };
    
    // Optimistically update the UI
    setEvents(prevEvents =>
      prevEvents.map(ev =>
        ev.id === event.id ? { ...ev,  start ,  end  } : ev
      )
    );

    try {
      await axios.put(`${base_url}/api/appointments/${event.id}`, {
        ...event,
        start ,
        end 
      });
      // If successful, the optimistic update remains
    } catch (error) {
      console.error('Error updating appointment:', error);
      // Revert to the original state if the API call fails
      setEvents(prevEvents =>
        prevEvents.map(ev =>
          ev.id === event.id ? originalEvent : ev
        )
      );
      alert('Failed to update the appointment. The change has been reverted.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleResizeEvent = async ({ event, start, end }) => {
    const updatedEvent = {
      title: event.title,
      start,
      end,
    };
  
    const updatedEvents = events.map(e =>
      e.id === event.id ? { ...e, start, end } : e
    );
  
    // Optimistically update the UI
    setEvents(updatedEvents); 
  
    try {
      await axios.put(`${base_url}/api/appointments/${event.id}`, updatedEvent);
    } catch (error) {
      console.error('Error updating appointment:', error);
      
      // Revert changes if the API call fails
      setEvents(events); // Reset to previous state
    } finally {
    }
  };
 
  const handleDeleteEvent = async (eventToDelete) => {
    // Optimistically update the UI by removing the event immediately
    const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
    setEvents(updatedEvents); // Update local state immediately
  
    try {
      // Make an API call to delete the appointment from the database
      await axios.delete(`${base_url}/api/appointments/${eventToDelete.id}`);
    } catch (error) {
      console.error('Error deleting appointment:', error); // Handle error
      
      // If the deletion fails, revert to the original state
      setEvents(events); // Reset to previous state
    } finally {
    }
  }
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