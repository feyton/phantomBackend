export const IdRequired = (req, res, next) => {
    let id = req.params.id
    if (!id)
        return res.status(400).json({ message: 'Missing required parameter' })
    return next()
}
