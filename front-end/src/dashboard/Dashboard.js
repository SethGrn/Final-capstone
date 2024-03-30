import React, { useEffect, useState } from "react";
import { next, previous } from "../utils/date-time"
import { listReservations } from "../utils/api";
import { listTables } from "../utils/api"
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../reservation/ReservationList"
import TableList from "../table/TableList"


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
  const [tables, setTables] = useState([]);
  
  const [fetchError, setFetchError] = useState(null);

  const [dashboardDate, setDashboardDate] = useState(date)


  useEffect(loadDashboard, [dashboardDate]);

  function loadDashboard() {
    const abortController = new AbortController();
    setFetchError(null);
    listReservations({ date: dashboardDate }, abortController.signal)
      .then(setReservations)
      .catch(setFetchError);
    listTables(abortController.signal)
      .then(setTables)
      .catch(setFetchError)
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {dashboardDate}</h4>
      </div>
      <div className="d-grid gap-4 d-md-flex">
        <button type="button" className="btn btn-primary mr-3" onClick={() => setDashboardDate(previous(dashboardDate))}>Previous day</button>
        <button type="button" className="btn btn-primary" onClick={() => setDashboardDate(next(dashboardDate))}>Next day</button>
      </div>
      <ErrorAlert error={fetchError} />
      <div className="container">
      <div className="row">
        <div className="col-md-6">
          <ReservationList reservations={reservations} />
        </div>
        <div className="col-md-6">
          <TableList tables={tables} />
        </div>
      </div>
    </div>
    </main>
  );
}

export default Dashboard;
