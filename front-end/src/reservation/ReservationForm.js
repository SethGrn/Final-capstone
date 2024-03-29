import React, { useState } from "react";
import { useHistory } from "react-router-dom"
import { createReservation, update } from "../utils/api.js"
import ErrorAlert from "../layout/ErrorAlert.js"

export default function ReservationForm ({ reservation = null }) {
    const METHOD = reservation ? "PUT" : "POST"
    const history = useHistory();
    const reservation_id = reservation ? reservation.reservation_id : null

    const initialFormData = {
        first_name: reservation ? reservation.first_name : "",
        last_name: reservation ? reservation.last_name : "",
        mobile_number: reservation ? reservation.mobile_number : "",
        reservation_date: reservation ? reservation.reservation_date : "",
        reservation_time: reservation ? reservation.reservation_time : "",
        people: reservation ? reservation.people : ""
    }

    const [formData, setFormData] = useState(initialFormData);
    const [formError, setFormError] = useState(null)

    const changeHandler = ({ target }) => {
        setFormData({
            ...formData,
            [target.name]: target.value
        })
    }
    
    async function submitHandler(event) {
        event.preventDefault();
      
        // Create an AbortController instance
        const abortController = new AbortController();
        let requestCompleted = false; // Variable to track whether the request has been completed
      
        try {
            // Clear any previous form errors
            setFormError(null);
      
            // Parse the number of people from formData
            formData.people = parseInt(formData.people, 10);
              
            if (METHOD === "POST") {
                // Await the createReservation function with the formData and abort signal
                await createReservation({ data: formData }, abortController.signal);
          
                // If the reservation is created successfully, redirect to the dashboard
                history.push(`/dashboard?date=${formData.reservation_date}`);
            } else {
                await update({ data: formData }, reservation_id , abortController.signal);
                history.push(`/dashboard?date=${formData.reservation_date}`);
            }
    
            // Mark the request as completed
            requestCompleted = true;
        } catch (error) {
            // Handle errors
            if (error.name === 'AbortError') {
                // Handle abort error (request was aborted)
                console.log('Request aborted');
            } else {
                // Handle other errors
                console.error('Error creating reservation:', error);
      
                // Set the form error state to display an error message to the user
                setFormError(error);
            }
        } finally {
            // Cleanup: Abort the fetch request to prevent memory leaks
            if (!requestCompleted) {
                abortController.abort();
            }
        }
    }

    function cancelHandler () {
        history.goBack()
    }

    return(
      <div className="container">
          {METHOD === "PUT" ? <h1>Edit reservation</h1> : <h1>New Reservation</h1>}
          <ErrorAlert error={formError} />
          <form onSubmit={submitHandler} className="form">
              <div className="form-group">
                  <label htmlFor="first_name">First name:</label>
                  <input 
                      name="first_name"
                      id="first_name"
                      type="text"
                      className="form-control"
                      required
                      value={formData.first_name}
                      onChange={changeHandler}
                  />
              </div>
              <hr />
              <div className="form-group">
                  <label htmlFor="last_name">Last name:</label>
                  <input
                      name="last_name"
                      id="last_name"
                      type="text"
                      className="form-control"
                      required
                      value={formData.last_name}
                      onChange={changeHandler}
                  />
              </div>
              <hr />
              <div className="form-group">
                  <label htmlFor="mobile_number">Number:</label>
                  <input
                      name="mobile_number"
                      id="mobile_number"
                      type="text"
                      className="form-control"
                      minLength="10"
                      maxLength="12"
                      required
                      value={formData.mobile_number}
                      onChange={changeHandler}
                  />
              </div>
              <hr />
              <div className="form-group">
                  <label htmlFor="reservation_date">Reservation date:</label>
                  <input
                      name="reservation_date"
                      id="reservation_date"
                      type="date"
                      className="form-control"
                      required
                      value={formData.reservation_date}
                      onChange={changeHandler}
                  />
              </div>
              <hr />
              <div className="form-group">
                  <label htmlFor="reservation_time">Reservation time:</label>
                  <input
                      name="reservation_time"
                      id="reservation_time"
                      type="time"
                      className="form-control"
                      required
                      value={formData.reservation_time}
                      onChange={changeHandler}
                  />
              </div>
              <hr />
              <div className="form-group">
                  <label htmlFor="people">Number of people:</label>
                  <input
                      name="people"
                      id="people"
                      type="number"
                      className="form-control"
                      required
                      value={formData.people}
                      onChange={changeHandler}
                  />
              </div>
              <hr />
              <button name="submit" type="submit" className="btn btn-primary mr-3">Submit</button> 
              <button name="cancel" type="button" className="btn btn-secondary" onClick={cancelHandler}>Cancel</button>
          </form>
      </div>
    )
}