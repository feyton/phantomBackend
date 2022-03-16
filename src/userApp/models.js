import bcrypt from 'bcrypt'
import sequelize from 'sequelize'
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
export default User
