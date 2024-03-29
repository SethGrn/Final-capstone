import React from 'react';
import { updateStatus } from "../utils/api.js"

export default function ReservationList({ reservations }) {
    reservations = reservations.filter((reservation) => reservation.status !== "finished");

    async function cancelHandler ({ target }) {
        const reservation_id = target.value
        const message = "Do you want to cancel this reservation? This cannot be undone.";
        if (window.confirm(message)) {
            await updateStatus({ data: { status: "cancelled" } }, reservation_id)
            window.location.reload();
        }
    }

    const reservationList = reservations.map((reservation, index) => (
        
        <div className="card bg-light" key={index}>
            <div className="card-body">
                <h5 className="card-title">{reservation.first_name} {reservation.last_name}</h5>
                <p className="card-text">Time: {reservation.reservation_time}</p>
                <p className="card-text">Number: {reservation.mobile_number}</p>
                <p className="card-text">Party size: {reservation.people}</p>
                <p className="card-text" data-reservation-id-status={reservation.reservation_id}>Status: { reservation.status }</p>
            </div>
            <div className="card-body">
                {reservation.status === "booked" ? <a href={`/reservations/${reservation.reservation_id}/seat`} className="card-link btn btn-success">Seat</a> : null}
                <a className="card-link btn btn-primary" href={`/reservations/${reservation.reservation_id}/edit`}>Edit</a>
                {reservation.status !== "cancelled" ? <button className="card-link btn btn-danger" type="button" onClick={cancelHandler} data-reservation-id-cancel={reservation.reservation_id} value={reservation.reservation_id}>Cancel</button> : null}
            </div>
        </div>
    ));

    return (
        <div>
            {reservationList}
        </div>
    );
}