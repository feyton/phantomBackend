import sequelize from 'sequelize'
import db from '../config/db.config.js'

const Driver = db.define('driver', {
    license: sequelize.STRING,
})

export default Driver
