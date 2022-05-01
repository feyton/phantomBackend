import sequelize from 'sequelize'
import db from '../config/db.config.js'
const Bus = db.define('bus', {
    plate: {
        type: sequelize.STRING,
        allowNull: false,
    },
})

Bus.hasOne('user')
export {}
