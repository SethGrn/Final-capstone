const knex = require("../db/connection");
const table = "reservations";

function list (date) {
    return knex(table)
        .where({ reservation_date: date })
        .select("*")
        .orderBy("reservation_time")
}

function create (reservation) {
    console.log(reservation)
    return knex(table)
        .insert(reservation)
        .returning("*")
        .then((data) => data[0])
}

module.exports = {
    list,
    create
}