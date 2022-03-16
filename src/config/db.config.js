import sequelize from 'sequelize'

const db = new sequelize('phantom', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5300,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 1000,
    },
})

export default db
