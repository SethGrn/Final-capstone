const knex = require("../db/connection");
const table = "tables"

function getReservation (reservation_id) {
    return knex("reservations")
        .where({ reservation_id })
        .select("*")
        .first()
}

function create (data) {
    return knex(table)
        .insert(data)
        .returning("*")
        .then((data) => data[0])
}

function read (table_id) {
    return knex(table)
        .where({ table_id })
        .select("*")
        .first()
}

function list () {
    return knex(table)
    .select("*")
    .orderBy("table_name")
}

async function update (table_id, reservation_id) {
    const tableData = await knex(table)
        .where({ table_id })
        .update({ 
            reservation_id
        })
        .returning("*")
        .then((data) => data[0])

    await knex("reservations")
        .where({ reservation_id })
        .update({ status: "seated" })
        

    return tableData;
}

async function freeTable (table_id) {
    const { reservation_id } = await read(table_id)
    console.log(reservation_id)

    const tablesData = await knex(table)
        .where({ table_id })
        .update({
            reservation_id: null
        })
        .returning("*")
        .then((data) => data[0])

    await knex("reservations")
        .where({ reservation_id })
        .update({ status: "finished" })
        .returning("*")
        .then((data) => data[0])

    return tablesData
}

module.exports = {
    create,
    read,
    update,
    list,
    freeTable,
    getReservation
}
