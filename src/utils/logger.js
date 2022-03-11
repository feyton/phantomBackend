const Logger = (req, res, next) => {
    const message = `${req.method} ${req.url}`
    console.log(message)
    next()
}

export default Logger
