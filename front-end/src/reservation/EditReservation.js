import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import ReservationForm from "./ReservationForm";
import { getReservation } from "../utils/api"
import ErrorAlert from "../layout/ErrorAlert";

export default function EditReservation () {
    const { reservation_id } = useParams()

    const [reservation, setReservation] = useState()
    const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    async function loadReservation() {
      const abortController = new AbortController();
  
      try {
        setFetchError(null);
        const reservationData = await getReservation(reservation_id, abortController.signal)
        setReservation(reservationData)
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          console.error('Error creating reservation:', error);
    
          setFetchError(error);
        }
      } finally {
        abortController.abort();
      }
    }
    loadReservation()
  }, [reservation_id]);

    return (
    <div>
        <ErrorAlert error={fetchError} />
        { reservation ? <ReservationForm reservation={reservation} /> : null}
    </div>
    )
}
