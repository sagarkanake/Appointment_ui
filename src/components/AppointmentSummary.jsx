import React from 'react';
import { Link } from 'react-router-dom';

function AppointmentSummary({ appointments }) {
  // Sort appointments by start time
  const sortedAppointments = [...appointments].sort((a, b) => a.start - b.start);

  // Filter to only show future appointments
  const upcomingAppointments = sortedAppointments.filter(
    appointment => new Date(appointment.start) > new Date()
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upcoming Appointments</h1>
      <Link to="/">Back to Calendar</Link>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {upcomingAppointments.map(appointment => (
          <li key={appointment.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <strong>{appointment.title}</strong>
            <br />
            Date: {new Date(appointment.start).toLocaleDateString()}
            <br />
            Time: {new Date(appointment.start).toLocaleTimeString()} - {new Date(appointment.end).toLocaleTimeString()}
          </li>
        ))}
      </ul>
      {upcomingAppointments.length === 0 && <p>No upcoming appointments.</p>}
    </div>
  );
}

export default AppointmentSummary