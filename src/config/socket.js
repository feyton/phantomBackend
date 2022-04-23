import http from 'http'
import { Server } from 'socket.io'
import { app } from '../index.js'

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



export default socket
