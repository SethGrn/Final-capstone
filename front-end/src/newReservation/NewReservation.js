import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api.js"
import ErrorAlert from "../layout/ErrorAlert"

function NewReservation () {

    const history = useHistory();

    const initialFormData = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 0
    }

    //
    // FOR TESTING PURPOSES ONLY
    /*
    initialFormData.first_name = "John"
    initialFormData.last_name = "Smith"
    initialFormData.mobile_number = "123-456-7890"
    initialFormData.reservation_date = new Date()
    initialFormData.reservation_time = "18:00"
    initialFormData.people = 2
    */
    // FOR TESTING PURPOSES ONLY 
    //

    const [formData, setFormData] = useState(initialFormData);
    const [formError, setFormError] = useState(null)

    const changeHandler = ({ target }) => {
        setFormData({
            ...formData,
            [target.name]: target.value
        })
    }

    // old submit handler
    /*async function submitHandler (event) {
        event.preventDefault();
        const abortController = new AbortController();
        setFormError(null);
        formData.people = parseInt(formData.people, 10)
        await createReservation({ data: formData }, abortController.signal)
        history.push(`/dashboard?date=${formData.reservation_date}`)
    }*/
    
    async function submitHandler(event) {
        event.preventDefault();
      
        // Create an AbortController instance
        const abortController = new AbortController();
      
        try {
          // Clear any previous form errors
          setFormError(null);
      
          // Parse the number of people from formData
          formData.people = parseInt(formData.people, 10);
      
          // Await the createReservation function with the formData and abort signal
          await createReservation({ data: formData }, abortController.signal);
      
          // If the reservation is created successfully, redirect to the dashboard
          history.push(`/dashboard?date=${formData.reservation_date}`);
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
          abortController.abort();
        }
      }

    function cancelHandler () {
        setFormData(initialFormData)
        history.push("/dashboard");
    }

    return(
        <div>
            <h1> New Reservation </h1>
            <ErrorAlert error={formError} />
            <form onSubmit={submitHandler}>
                <label htmlFor="first_name">First name: </label>
                <input 
                    name="first_name"
                    id="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={changeHandler}
                />
                <hr />
                <label htmlFor="last_name">Last name: </label>
                <input
                    name="last_name"
                    id="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={changeHandler}
                />
                <hr />
                <label htmlFor="mobile_number">Number: </label>
                <input
                    name="mobile_number"
                    id="mobile_number"
                    type="text"
                    minLength="10"
                    maxLength="12"
                    required
                    value={formData.mobile_number}
                    onChange={changeHandler}
                />
                <hr />
                <label htmlFor="reservation_date">Reservation date: </label>
                <input
                    name="reservation_date"
                    id="reservation_date"
                    type="date"
                    required
                    value={formData.reservation_date}
                    onChange={changeHandler}
                />
                <hr />
                <label htmlFor="reservation_time">Reservation time: </label>
                <input
                    name="reservation_time"
                    id="reservation_time"
                    type="time"
                    required
                    value={formData.reservation_time}
                    onChange={changeHandler}
                />
                <hr />
                <label htmlFor="people">Number of people: </label>
                <input
                    name="people"
                    id="people"
                    type="number"
                    required
                    value={formData.people}
                    onChange={changeHandler}
                />
                <hr />
                <button name="submit" type="submit">Create reservation</button> 
                <button name="cancel" type="button" onClick={cancelHandler}>Cancel</button>
            </form>
        </div>
    )
}

export default NewReservation;
