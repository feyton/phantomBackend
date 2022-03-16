const resHandler = (res, status, message, data) => {
    return res.status(status).json({ message: message, data })
}

export default resHandler
