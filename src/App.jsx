import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import WeeklyCalendar from './components/WeeklyCalendar';
import AppointmentSummary from './components/AppointmentSummary';

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

function App() {
  const [events, setEvents] = useState(initialEvents);

  return (
    <Router>
      <div className="App">
        <nav style={{ marginBottom: '20px' }}>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ display: 'inline', marginRight: '10px' }}>
              <Link to="/">Calendar</Link>
            </li>
            <li style={{ display: 'inline' }}>
              <Link to="/summary">Appointment Summary</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<WeeklyCalendar events={events} setEvents={setEvents} />} />
          <Route path="/summary" element={<AppointmentSummary appointments={events} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;