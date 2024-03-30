const knex = require("../db/connection");
const table = "reservations";

function list (date) {
    return knex(table)
        .where({ reservation_date: date })
        .select("*")
        .orderBy("reservation_time")
        .then((data) => {
            return data.filter((reservation) => reservation.status !== "finished")
        })
}

function create (reservation) {
    return knex(table)
        .insert(reservation)
        .returning("*")
        .then((data) => data[0])
}

function read (reservation_id) {
    return knex(table)
        .where({ reservation_id })
        .select("*")
        .first();
}

async function updateStatus (reservation_id, status) {
    await knex(table)
        .where({ reservation_id })
        .update({ status })

    return read(reservation_id)
}

function search(mobile_number) {
    return knex(table)
        .whereRaw(
       "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

async function update(reservation_id, data) {
    await knex(table)
        .where({ reservation_id })
        .update({ 
            ...data
         })
    
    return read(reservation_id)
}

module.exports = {
    list,
    create,
    read,
    update,
    updateStatus,
    search
}
