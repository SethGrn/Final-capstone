const service = require("./reservations.service")
const asyncErrorBoundary = require("../utils/asyncErrorBoundary")
const hasProperties = require("../utils/hasProperties")
const currentDate = require("../utils/currentDate")

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
)

const VALID_PROPERTIES = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at"
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

// Make sure the 'date' property of the request is a valid date using regex,
// if so, make sure it is not on a Tuesday (restaurant is closed) and make sure it is for a future date
function validDate (req, res, next) {
  const { data = {} } = req.body;

  const { reservation_date } = data;
  const reservation_day = new Date(reservation_date)
  const day = currentDate();

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  let errorCode = 0;

  const match = regex.test(reservation_date);
  if (!match) errorCode = 1;

  // check if current date is a Tuesday
  if (reservation_day.getDay() === 2) errorCode = 2;

  // check if current day is in the past
  if (reservation_date < day) errorCode = 3;


  const invalidFormatError = {
    status: 400,
    message: `reservation_date (${reservation_date}) is not a valid date`
  }

  const dateIsATuesdayError = {
    status: 400,
    message: `reservation_date (${reservation_date}) must be a date the restaurant is open (This restaurant is closed on Tuesdays)`
  }

  const dateIsInThePastError = {
    status: 400,
    message: `reservation_date (${reservation_date}) must be a date in the future`
  }

  switch(errorCode) {
    case 1:
      next(invalidFormatError)
      break;
    case 2:
      next(dateIsATuesdayError)
      break;
    case 3:
      next(dateIsInThePastError)
      break;
    default:
      if (reservation_day === day) {
        res.locals.checkTime = true;
      }
      return next();
  }
}

// Make sure the 'time' property of the request is a valid time using regex
function validTime (req, res, next) {
  const { data = {} } = req.body;

  const regex = /^\d{2}:\d{2}$/;
  const regex2 = /^\d{2}:\d{2}:\d{2}$/;

  const { reservation_time } = data;

  const match = regex.test(reservation_time)
  const match2 = regex2.test(reservation_time)

  const error = { 
    status: 400,
    message: `reservation_time (${reservation_time}) is not a valid time`
  }

  
  
  // check time individually to see if it is a valid date in the future
  let time = reservation_time.split(":")
  let hours = parseInt(time[0])
  let minutes = parseInt(time[1]);
  let currentTime = new Date();
  let currentHours = currentTime.getHours();
  if (hours <= 10 && minutes <= 30) return next(error)
  if (hours >= 22 || (hours >= 21 && minutes >= 30)) return next(error)
  if (res.locals.checkTime) {
    if (hours < currentHours) return next(error)
  }

  if (match || match2) {
    return next()
  }else {
    return next(error)
  }
}

// Make sure the 'people' property of the request is a number
function validPeople (req, res, next) {
  const { data = {} } = req.body;
  const { people } = data;
  
  if (typeof people === "number") {
    return next();
  } else {
    const error = { status: 400, message: `people property must be a number` }
    return next(error)
  }
}

function validStatus (req, res, next) {
  const { data = {} } = req.body;
  const { status } = data;

  if (status) {
    if (status === "booked") {
      return next()
    } else {
      return next({
        status: 400,
        message: `Status of: ${status} not allowed`
      })
    }
  } else {
    return next();
  }
}

async function reservationExists (req, res, next) {
  const { reservation_id } = req.params;

  const reservation = await service.read(reservation_id)

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    return next({
      status: 404,
      message: `Reservation with id: ${reservation_id} does not exists`
    })
  }
}
/*
 * List handler for reservation resources
 */



async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (mobile_number) {
    const data = await service.search(mobile_number);
    res.status(200).json({ data: data });
  } else {
    const data = await service.list(date);
    res.status(200).json({ data: data });
  }
}

async function create(req, res) {
  const { data } = req.body;
  const response = await service.create(data)
  res.status(201).json({ data: response });
}

function read(req, res) {
  res.status(200).json({ data: res.locals.reservation })
}

async function updateStatusMiddleware (req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id)
  if (!reservation) return next({status: 404, message: `Reservation with id ${reservation_id} not found`})
  const currentStatus = reservation.status;

  if (currentStatus === "finished") {
    return next({
      status: 400,
      message: `The reservation with id: ${reservation_id} is already finished`
    })
  }

  const { status } = req.body.data;
  if (status === "booked" || status === "seated" || status === "finished" || status === "cancelled") {
    next()
  } else {
    next({
      status: 400,
      message: `A status of: ${status} is not valid`
    })
  }
}

async function updateStatus(req, res) {
  const { status } = req.body.data;
  const { reservation_id } = req.params;
  res.status(200).json({ data: await service.updateStatus(reservation_id, status) })
}

async function update(req, res) {
  const { data } = req.body;
  const { reservation_id } = req.params;
  const response = await service.update(reservation_id, data)
  res.status(200).json({ data: response });
}

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    validDate,
    validTime,
    validPeople,
    validStatus,
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    read,
  ],
  update: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    validDate,
    validTime,
    validPeople,
    validStatus,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(update)
  ],
  list: asyncErrorBoundary(list),
  updateStatus: [
    asyncErrorBoundary(updateStatusMiddleware),
    asyncErrorBoundary(updateStatus)
  ]
};
