import cors from 'cors'
import dotenv from 'dotenv'
import express, { static as staticExpress } from 'express'
import path, { join } from 'path'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {
    optionsToCustomizeSwagger,
    swaggerOptions,
} from './config/Swagger.config.js'
import apiRoute from './index/routes.js'
import Logger from './utils/logger.js'
const swaggerSpec = swaggerJSDoc(swaggerOptions)

dotenv.config()
const PORT = process.env.PORT || 3000
const __dirname = path.resolve()
const app = express()
app.use(cors())
app.use(Logger)
app.use(staticExpress(join(__dirname, 'public')))
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, optionsToCustomizeSwagger, { explorer: true })
)

app.use('/api/v1', apiRoute)
app.all('*', (req, res) => {
    return res.status(200).json({ message: 'Welcome to the club' })
})

app.listen(PORT, () => {
    console.log('The app is running: ', PORT)
})
