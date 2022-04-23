import bodyParser from 'body-parser'
import ConnectLiveReload from 'connect-livereload'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { static as staticExpress } from 'express'
import http from 'http'
import liveraload from 'livereload'
import path, { join } from 'path'
import redis from 'redis'
import { Server } from 'socket.io'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import db from './config/db.config.js'
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

app.use(ConnectLiveReload())
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
let Buses = []
let Users = []

// IO Setup
const client = redis.createClient({
    socket: {
        port: 8765,
        host: 'localhost',
    },
})

client.once('ready', () => {
    console.log('Redis connected')
    client.get('sub_users', (err, reply) => {
        if (reply) {
            Users = JSON.parse(reply)
        }
    })
    client.get('bus_location', (err, reply) => {
        if (reply) {
            Buses = JSON.parse(reply)
        }
    })
})
client.on('connect', () => {
    console.log('connected')
})

app.post('/track/:id', async (req, res) => {
    let username = req.body.username
    if (Users.indexOf(username) === -1) {
        Users.push(username)
        client.set('sub_users', JSON.stringify(Users))
        res.send({
            users: Users,
            status: 'ok',
        })
    } else {
        res.send({
            status: 'failed',
        })
    }
})
app.put('/track/:id', async (req, res) => {
    let username = req.body.username
    Users.splice(Users.indexOf(username), 1)
    client.set('sub_users', JSON.stringify(Users))
    res.send({
        status: 'ok',
    })
})
app.post('/location/:id', async (req, res) => {
    let username = req.body.username
    let location = req.body.location

    client.set('sub_users', JSON.stringify(Users))
    res.send({
        status: 'ok',
    })
})
app.get('/track/:id', async (req, res) => {
    let username = req.body.username
    Users.splice(Users.indexOf(username), 1)
    client.set('sub_users', JSON.stringify(Users))
    res.send({
        status: 'ok',
    })
})
io.on('connection', (socket) => {
    console.log('Established connecttion')
    socket.on('message', (data) => {
        io.emit('send', data)
    })
    socket.on('location_update', (data) => {
        console.log(data)
        io.emit('location_update', data)
    })
})
app.use('/api/v1', apiRoute)
app.get('/', (req, res) => {
    return res.sendFile(join(__dirname, 'src/index', 'index.html'))
})
app.get('/pub', (req, res) => {
    return res.sendFile(join(__dirname, 'src/index', 'pub.html'))
})
app.all('*', (req, res) => {
    return res.status(200).json({ message: 'Welcome to the club' })
})

const liverReloadServer = liveraload.createServer()
liverReloadServer.watch(join(__dirname, 'public'))
liverReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liverReloadServer.refresh('/')
    }, 100)
})

db.authenticate()
    .then(async () => {
        await db.sync()
        await client.connect()
        console.log('The database is connected successfully')

        server.listen(PORT, () => {
            console.log('The app is running: ', PORT)
        })
    })
    .catch((e) => {
        console.log('Something went wrong:', e.message)
    })
