import React from "react";
import { freeTable } from "../utils/api.js"

export default function TableList ({ tables = [] }) {

    async function finishHandler (table) {
        const message = "Is this table ready to seat new guests? This cannot be undone."
        if(window.confirm(message)) {
            await freeTable(table.table_id)
            window.location.reload();
        }
    }

    const tableList = tables.map((table, index) => (
        <div className="card bg-light" key={index}>
            <div className="card-body">
                <h5 className="card-title">{table.table_name}</h5>
                <p className="card-text">Capacity: {table.capacity}</p>
                <p>
                    Status: <span data-table-id-status={table.table_id}>{table.reservation_id ? "Occupied" : "Free"}</span>
                </p>
                {table.reservation_id ? (
                <button 
                    data-table-id-finish={table.table_id} 
                    type="button"
                    className="btn btn-danger"
                    onClick={() => finishHandler(table)}
                >Finish</button>
            ) : null}
            </div>
        </div>

    ));
    return tableList
}