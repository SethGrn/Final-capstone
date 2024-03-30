import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { listTables, seatReservation } from "../utils/api"
import ErrorAlert from "../layout/ErrorAlert"

export default function Seat () {
    // Stash url parameters
    const { reservation_id } = useParams();
    // query database for reservation id
    // query database for all free tables
    const [tables, setTables] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [selectedTable, setSelectedTable] = useState();
    const history = useHistory();

    useEffect(loadTables, []);

    function loadTables() {
        const abortController = new AbortController();
        setFetchError(null);
        listTables(abortController.signal)
        .then(setTables)
        .catch(setFetchError);
        return () => abortController.abort();
    }

    const tableList = tables.map((table, index) => {
        return (
            <option key={index} value={table.table_id} disabled={table.reservation_id}>
              {table.table_name} - {table.capacity}{table.reservation_id ? " (Occupied)" : null}
            </option>
          );
    })

    function cancelHandler () {
        history.goBack();
    }

    async function submitHandler (event) {
        event.preventDefault();
        const abortController = new AbortController();

        try {
            // selectedTable = the id of the table selected, we will PUT to /tables/${selectedTable}/seat
            // Howerver, we will PUT with { data: { reservation_id } } (The id in the url)
            await seatReservation({ data: { reservation_id } }, selectedTable, abortController.signal)

            history.push("/dashboard")
        } catch (error) {
            // Handle errors
            if (error.name === 'AbortError') {
                // Handle abort error (request was aborted)
                console.log('Request aborted');
            } else {
                // Handle other errors
                console.error('Error creating reservation:', error);
        
                // Set the form error state to display an error message to the user
                setFetchError(error);
            }
        } finally {
            // Cleanup: Abort the fetch request to prevent memory leaks
            abortController.abort();
        }
    }

    async function changeHandler (event) {
        setSelectedTable(event.target.value)
    }

    return (
        <div>
            <h1>In Progress</h1>
            <ErrorAlert error={fetchError} />
            <form onSubmit={submitHandler}>
            <select name="table_id" onChange={changeHandler}>
                <option value="">--Please select a table--</option>
                {tableList}
            </select>
            <button type="submit">Submit</button>
            <button type="button" onClick={cancelHandler}>Cancel</button>
            </form>
        </div>
    )
}