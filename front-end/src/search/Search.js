import React, { useState } from "react"
import ReservationList from "../reservation/ReservationList"
import { listReservations } from "../utils/api"

export default function Search () {

    const [number, setNumber] = useState("");

    const [reservations, setReservations] = useState([])

    function changeHandler ({ target }) {
        setNumber(target.value)
    }
    
    function submitHandler (event) {
        event.preventDefault();
        const abortController = new AbortController();

        listReservations({ mobile_number: number }, abortController.signal)
            .then((reservationList) => reservationList.length ? setReservations(reservationList) : setReservations("empty"))
        
        return () => abortController.abort();
    }

    return (
        <div>
            <h1>Search for reservation by phone number:</h1>
            <form onSubmit={submitHandler} class="form-inline">
                <div class="form-group">
                    <input
                        name="mobile_number"
                        type="text"
                        class="form-control"
                        placeholder="Enter a customer's phone number"
                        required
                        value={number}
                        onChange={changeHandler}
                    />
                </div>
                <button type="submit" class="btn btn-primary ml-2">Find</button>
            </form>
            <hr/>
            {reservations === "empty" ? <h3>No reservations found for that number</h3> : <ReservationList reservations={reservations} />}
        </div>
    )
}