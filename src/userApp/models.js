import bcrypt from 'bcrypt'
import sequelize from 'sequelize'
import { v4 as uuid } from 'uuid'
import db from '../config/db.config.js'
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12)
}

const User = db.define('user', {
    firstName: {
        type: sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize.STRING(64),
        allowNull: false,
    },
})

User.beforeCreate(async (user, options) => {
    const hashedPassword = await hashPassword(user.password)
    user.password = hashedPassword
})
User.beforeUpdate(async (user) => {
    const hashedPassword = await hashPassword(user.password)
    user.password = hashedPassword
})
User.prototype.checkPass = async function (password) {
    const pass = await bcrypt.compare(password, this.password)
    console.log(pass)
    return pass
}

export const Trip = db.define('trip', {
    uuid: {
        type: sequelize.STRING,
        allowNull: true,
    },
    path: {
        type: sequelize.TEXT,
        allowNull: false,
    },
    loggedAt: {
        type: sequelize.STRING,
    },
})

Trip.beforeCreate(async (trip) => {
    trip.uuid = uuid()
    trip.loggedAt = new Date().toLocaleString('en-GB')
})
export default User
