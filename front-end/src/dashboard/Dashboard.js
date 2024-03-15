import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import { next, previous } from "../utils/date-time"
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('date')) date = params.get('date');
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const [dashboardDate, setDashboardDate] = useState(date)


  useEffect(loadDashboard, [dashboardDate]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: dashboardDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {dashboardDate}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      {JSON.stringify(reservations)}
      <button onClick={() => setDashboardDate(next(dashboardDate))}>Next day</button>
      <button onClick={() => setDashboardDate(previous(dashboardDate))}>Previous day</button>
    </main>
  );
}

export default Dashboard;
