const Logger = (req, _, next) => {
    const message = `${req.method} ${req.url}`
    console.log(message)
    next()
}

export default Logger
