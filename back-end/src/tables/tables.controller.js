
const tablesService = require("./tables.service")
const asyncErrorBoundary = require("../utils/asyncErrorBoundary")
const hasProperties = require("../utils/hasProperties")

const hasRequiredProperties = hasProperties(
    "table_name",
    "capacity"
)

const VALID_PROPERTIES = [
    "table_name",
    "capacity",
    "reservation_id"
]

function hasOnlyValidProperties(req, res, next) {
    const { data = {} } = req.body;
  
    const invalidFields = Object.keys(data).filter((field) => !VALID_PROPERTIES.includes(field))
  
    if (invalidFields.length) {
      return next ({
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`
      })
    }
    next()
  }

function bodyHasDataProperty (req, res, next) {
    return req.body.data ? next() : next({
        status: 400,
        message: "Request body must have a `data` property"
    })
}

function reservationIdExists (req, res, next) {
    const { reservation_id } = req.body.data;
    
    return reservation_id ? next() : next({ 
        status: 400,
        message: `PUT request must have a valid reservation_id property`
    })
}

async function getReservation (req, res, next) {
    const { reservation_id } = req.body.data;

    const reservation = await tablesService.getReservation(reservation_id);
    if (reservation) {
        res.locals.reservation = reservation;
        next()
    } else {
        next({
            status: 404, message: `reservation_id: ${reservation_id} does not exists`
        })
    }
}

async function getTable (req, res, next) {
    const { table_id } = req.params;
    const table = await tablesService.read(table_id)
    if (table) {
        res.locals.table = table;
        return next()
    } else {
        next({
            status: 404,
            message: `Table with id ${table_id} does not exists`
        })
    }
}

function tableHasCapacity (req, res, next) {
    const { reservation } = res.locals;
    const { table } = res.locals;
    const { people } = reservation;
    const { capacity } = table;
    // If #people in reservation is greate than capacity of the table
    if (people > capacity) {
        return next({
            status: 400,
            message: "Table does not have capacity for this reservation, please choose another table."
        })
    } else {
        return next();
    }
}

function table_nameIsValid (req, res, next) {
    const { table_name } = req.body.data;
    if (table_name.length > 1) {
        return next()
    } else {
        return next({
            status: 400,
            message: "table_name property must be more than one character"
        })
    }
}

function capacityIsValid (req, res, next) {
    const { capacity } = req.body.data;
    if (typeof capacity === "number") {
        return next()
    } else {
        return next({
            status: 400,
            message: "capacity property must be a number"
        })
    }
}

async function create (req, res) {
    const { data } = req.body;
    
    res.status(201).json({ data: await tablesService.create(data)})
}

async function update (req, res) {
    const { table_id } = req.params;
    const { reservation } = res.locals;
    const { reservation_id } = reservation;
    
    res.status(200).json({ data: await tablesService.update(table_id, reservation_id) })
}

async function tableIsOccupied (req, res, next) {
    const { table_id } = req.params;

    const table = await tablesService.read(table_id);

    if (table.reservation_id) {
        return next();
    } else {
        return next({
            status: 400,
            message: `Table with id ${table_id} is not occupied`
        })
    }
}

async function tableIsNotOccupied (req, res, next) {
    const { table_id } = req.params;

    const table = await tablesService.read(table_id);

    if (!table.reservation_id) {
        return next();
    } else {
        return next({
            status: 400,
            message: `Table with id ${table_id} is occupied`
        })
    }
}

function tableIsNotSeated (req, res, next) {
    const { status } = res.locals.reservation;

    if (status === "booked") {
        return next();
    } else {
        return next({
            status: 400,
            message: `Reservation is already seated`
        })
    }
}

async function freeTable (req, res) {
    const { table_id } = req.params;

    res.status(200).json({ data: await tablesService.freeTable(table_id) })
}

async function list (req, res) {
    res.status(200).json({ data: await tablesService.list() })
}

module.exports = {
    create: [
        hasRequiredProperties,
        hasOnlyValidProperties,
        table_nameIsValid,
        capacityIsValid,
        create
    ],
    update: [
        bodyHasDataProperty,
        reservationIdExists,
        asyncErrorBoundary(getReservation),
        tableIsNotSeated,
        asyncErrorBoundary(getTable),
        asyncErrorBoundary(tableIsNotOccupied),
        tableHasCapacity,
        update,
    ],
    freeTable: [
        asyncErrorBoundary(getTable),
        asyncErrorBoundary(tableIsOccupied),
        asyncErrorBoundary(freeTable)
    ],
    list: asyncErrorBoundary(list)
}