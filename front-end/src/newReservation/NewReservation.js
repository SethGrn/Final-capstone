import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api.js"

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
    initialFormData.first_name = "Seth"
    initialFormData.last_name = "Greene"
    initialFormData.mobile_number = "123-456-7890"
    initialFormData.reservation_date = "2024-03-11"
    initialFormData.reservation_time = "08:00"
    initialFormData.people = 2
    */
    // FOR TESTING PURPOSES ONLY 
    //

    const [formData, setFormData] = useState(initialFormData);

    const changeHandler = ({ target }) => {
        setFormData({
            ...formData,
            [target.name]: target.value
        })
    }

    async function submitHandler (event) {
        formData.people = parseInt(formData.people, 10)
        event.preventDefault();
        await createReservation({ data: formData })
        history.push(`/dashboard?date=${formData.reservation_date}`)
    }

    function cancelHandler () {
        setFormData(initialFormData)
        history.push("/dashboard");
    }

    return(
        <div>
            <h1> New Reservation </h1>
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
