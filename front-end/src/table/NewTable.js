import React, { useState } from "react";
import { useHistory } from "react-router-dom"
import ErrorAlert from "../layout/ErrorAlert"
import { createTable } from "../utils/api"

function NewTable () {

    const history = useHistory();

    const initialFormData = {
        table_name: "",
        capacity: 0
    }

    const [formData, setFormData] = useState(initialFormData)
    const [formError, setFormError] = useState(null);

    function changeHandler ({ target }) {
        setFormData({
            ...formData,
            [target.name]: target.value
        })
    }

    function cancelHandler () {
        setFormData(initialFormData)
        history.goBack()
    }

    async function submitHandler(event) {
        event.preventDefault();
      
        // Create an AbortController instance
        const abortController = new AbortController();
      
        try {
          // Clear any previous form errors
          setFormError(null);
      
          // Parse the number of people from formData
          formData.capacity = parseInt(formData.capacity, 10);
      
          // Await the createReservation function with the formData and abort signal
          await createTable({ data: formData }, abortController.signal);
      
          // If the reservation is created successfully, redirect to the dashboard
          history.push(`/dashboard`);
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

    return (
        <div>
            <h1> New Table </h1>
            <ErrorAlert error={formError} />
            <form onSubmit={submitHandler} className="forcm">
              <div className="form-group">
                  <label htmlFor="table_name">Table name:</label>
                  <input
                      name="table_name"
                      id="table_name"
                      type="text"
                      className="form-control"
                      minLength="2"
                      required
                      onChange={changeHandler}
                      value={formData.table_name}
                  />
              </div>
              <div className="form-group">
                  <label htmlFor="capacity">Capacity:</label>
                  <input
                      name="capacity"
                      id="capacity"
                      type="number"
                      className="form-control"
                      required
                      min="1"
                      onChange={changeHandler}
                      value={formData.capacity}
                  />
              </div>
              <hr />
              <button name="submit" type="submit" className="btn btn-primary mr-2">Create table</button> 
              <button name="cancel" type="button" className="btn btn-secondary" onClick={cancelHandler}>Cancel</button>
          </form>
        </div>
    )
}

export default NewTable;