function methodNotAllowed (req, res, next) {
    res.send({ status: 405, message: `Method ${req.method} not allowed on ${req.originalUrl}` })
}

module.exports = methodNotAllowed;