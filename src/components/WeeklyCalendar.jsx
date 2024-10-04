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
    const momentStart = moment(start).startOf('day').add(13, 'hours'); // Set to 1 PM
    const momentEnd = moment(start).startOf('day').add(14, 'hours'); // Set to 2 PM
    const title = window.prompt('Enter appointment title:');
    if (title) {
      setIsLoading(true);
      const newEvent = {
        title,
        start: momentStart.toDate(), // Convert back to Date object
        end: momentEnd.toDate(), // Convert back to Date object
      };

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

  const EventComponent = ({ event }) => {
    const [showTooltip, setShowTooltip] = useState(false);
  
    return (
      <div className="relative p-2 border border-gray-300 rounded min-h-[40px] !flex items-center">
      {/* Title */}
      <div 
        className=" flex-1 text-base font-semibold break-words cursor-pointer mr-2" // Allow title to take remaining space
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {event.title}
      </div>

      {/* Delete Button */}
      <button 
        onClick={() => handleDeleteEvent(event)}
        className="w-12 h-8 text-sm text-red-600 bg-red-200 border-none rounded cursor-pointer transition-colors duration-300 ease-in-out hover:bg-red-300 flex items-center justify-center"
      >
        x
      </button>

      {/* Tooltip */}
      <div 
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity duration-200 ${showTooltip ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div className="bg-gray-800 text-white p-2 rounded text-sm max-w-[250px] break-words text-center shadow-lg relative">
          {event.title}
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3 bg-gray-800"></div>
        </div>
      </div>
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