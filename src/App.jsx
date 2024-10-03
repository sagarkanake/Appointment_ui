import React, { useState , useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import WeeklyCalendar from './components/WeeklyCalendar';
// import WeeklyCalendar from './components/test';
import AppointmentSummary from './components/AppointmentSummary';
import axios from 'axios'; // Import axios for API requests

function App() {
  const [events, setEvents] = useState([]);
  const base_url = import.meta.env.VITE_API_BASE_URL

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${base_url}/api/appointments`);
      const data = await response.json();
      
      // Map the data to include 'id' instead of '_id'
      const mappedData = data.map(appointment => ({
        id: appointment._id, // Use the _id from the response
        title: appointment.title,
        start: new Date(appointment.start), // Ensure to convert to Date object if needed
        end: new Date(appointment.end), // Ensure to convert to Date object if needed
      }));
  
      setEvents(mappedData);
      // setEvents(initialEvents);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);
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