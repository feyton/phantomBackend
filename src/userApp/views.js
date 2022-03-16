import resHandler from '../utils/resHandler.js'
import User from './models.js'

export const GetUsers = async (req, res, next) => {
    const users = await User.findAll()
    console.log(users)
    if (users) return res.json(users)
}

export const CreateUser = async (req, res, next) => {
    try {
        let newUser = await User.create(req.body)
        return res.json(newUser)
    } catch (error) {
        return res.status(400).json({
            message: 'Missing the required inputs',
            error: error.message,
        })
    }
}

export const UpdateUser = async (req, res, next) => {
    let id = req.params.id
    const user = await User.findOne({
        where: {
            id: id,
        },
    })
    return res.json(user)
}

export const LoginUser = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).json({ message: 'Invalid credentials' })
    const user = await User.findOne({ where: { email: email } })
    if (!user) return res.sendStatus(400)
    const pass = await user.checkPass(password)
    if (!pass) return res.status(400).json({ message: 'Invalid credentials' })
    return res.status(200).json({ user, message: 'Logged in successfully' })
}

export const deleteUser = async (req, res, next) => {
    const { password } = req.body
    const user = await User.findOne({ where: { id: req.params.id } })
    if (!user) return resHandler(res, 400, 'User not found', {})
    const pass = await user.checkPass(password)
    if (!pass) return resHandler(res, 400, 'Invalid password', {})
    await user.delete()
    return resHandler(res, 200, 'User deleted successfully', {})
}
