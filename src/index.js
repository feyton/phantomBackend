import bodyParser from 'body-parser'
import ConnectLiveReload from 'connect-livereload'
import cors from 'cors'
import 'dotenv/config'
import express, { static as staticExpress } from 'express'
import http from 'http'
import liveraload from 'livereload'
import path, { join } from 'path'
import redis from 'redis'
import { Server } from 'socket.io'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import apiRoute from '../views/routes.js'
import db from './config/db.config.js'
import {
    optionsToCustomizeSwagger,
    swaggerOptions,
} from './config/Swagger.config.js'
import { Trip } from './userApp/models.js'
import Logger from './utils/logger.js'
const swaggerSpec = swaggerJSDoc(swaggerOptions)

const PORT = process.env.PORT || 3000
const __dirname = path.resolve()
export const app = express()
app.use(ConnectLiveReload())
app.set('view engine', 'ejs')
app.use(cors())
app.use(Logger)
app.use(staticExpress(join(__dirname, 'public')))
app.use(bodyParser.json())
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: true,
    },
    allowEIO3: true,
})
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, optionsToCustomizeSwagger, { explorer: true })
)

// IO Setup
const client = redis.createClient({
    socket: {
        port: 8765,
        host: 'localhost',
        url: process.env.REDIS_URL,
    },
})

client.once('ready', () => {
    console.log('Redis connected')
})

io.on('connection', (socket) => {
    console.log('Established connecttion')
    socket.on('message', (data) => {
        io.emit('send', data)
    })
    socket.on('location_update', (data) => {
        io.emit('location_update', data)
    })
    socket.on('bus_stop', (data) => {
        io.emit('bus_update', data)
    })
    socket.on('finished', async (data) => {
        io.emit('bus_finished', {
            time: data.time,
        })
        const trip = await Trip.create({
            path: JSON.stringify(data.record),
        })
        console.log(trip.toJSON())
    })
})
app.use('/api/v1', apiRoute)
app.get('/', (req, res) => {
    return res.render('index')
})
app.get('/pub', (req, res) => {
    return res.render('pub')
})
app.get('/map', (req, res) => {
    return res.render('map')
})
app.all('*', (req, res) => {
    return res.status(200).json({ message: 'Not found' })
})

if (!process.env.NODE_ENV === 'production') {
    const liverReloadServer = liveraload.createServer()
    liverReloadServer.watch(join(__dirname, 'public'))
    liverReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liverReloadServer.refresh('/')
        }, 100)
    })
}

db.authenticate()
    .then(async () => {
        await db.sync()
        console.log('The database is connected successfully')
        server.listen(PORT, () => {
            console.log('The app is running: ', PORT)
        })
    })
    .catch((e) => {
        console.log(e)
        console.log('Something went wrong:', e.message)
    })

// TODO minimize the size of the icon
// TODO Determine the velocity
// TODO Disconnection/ Stop and clear wathc
