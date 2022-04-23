import 'dotenv/config'
import { Sequelize } from 'sequelize'

let options

if (process.env.NODE_ENV === 'production') {
    options = {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        logging: false,
        ssl: false,
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 1000,
        },
    }
} else {
    options = {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 1000,
        },
    }
}

const db = new Sequelize(options.url, {
    ...options,
})

export default db
