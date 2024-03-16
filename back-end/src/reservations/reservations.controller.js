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
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
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
  if (reservation_day.getDay() === 1) errorCode = 2;

  // check if current day is in the past
  if (reservation_day < day) errorCode = 3;


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
      return next();
  }
}

// Make sure the 'time' property of the request is a valid time using regex
function validTime (req, res, next) {
  const { data = {} } = req.body;

  const regex = /^\d{2}:\d{2}$/;

  const { reservation_time } = data;

  const match = regex.test(reservation_time)

  // check time individually to see if it is a valid date in the future
  let time = reservation_time.split(":")
  let hours = parseInt(time[0])
  let minutes = parseInt(time[1]);
  let currentTime = new Date();
  let currentHours = currentTime.getHours();
  let currentMinutes = currentTime.getMinutes();
  console.log(time, hours, minutes, currentTime, currentHours, currentMinutes)
  const error = { 
    status: 400,
    message: `reservation_time (${reservation_time}) is not a valid time`
  }
  if (hours <= 10 && minutes <= 30) return next(error)
  if (hours >= 22 || (hours >= 21 && minutes >= 30)) return next(error)
  if (hours < currentHours) return next(error)

  return match ? next() : next(error)
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

/*
 * List handler for reservation resources
 */



async function list(req, res) {
  const { date } = req.query;
  const data = await service.list(date);
  res.status(200).json({ data: data });
}

async function create(req, res) {
  const { data } = req.body;
  const response = await service.create(data)
  res.status(201).json({ data: response });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    validDate,
    validTime,
    validPeople,
    hasOnlyValidProperties,
    hasRequiredProperties,
    asyncErrorBoundary(create)
  ]
};
