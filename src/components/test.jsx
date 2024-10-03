import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

function WeeklyCalendar({ events, setEvents }) {
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('Enter appointment title:');
    if (title) {
      setEvents([
        ...events,
        {
          id: events.length + 1,
          title,
          start,
          end,
        },
      ]);
    }
  };

  const handleEventDrop = ({ event, start, end }) => {
    const updatedEvents = events.map(e => 
      e.id === event.id ? { ...e, start, end } : e
    );
    setEvents(updatedEvents);
  };

  const handleResizeEvent = ({ event, start, end }) => {
    const updatedEvents = events.map(e => 
      e.id === event.id ? { ...e, start, end } : e
    );
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventToDelete) => {
    const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
    setEvents(updatedEvents);
  };

  const EventComponent = ({ event }) => (
    <div>
      <strong>{event.title}</strong>
      <button onClick={() => handleDeleteEvent(event)} style={{ marginLeft: '5px' }}>x</button>
    </div>
  );

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

export default WeeklyCalendar;