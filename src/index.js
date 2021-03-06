const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app) 
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New client connected!')

    socket.on('join', (loginInfo) => {
        socket.join(loginInfo.room)

        socket.emit('message', generateMessage('Welcome to the Chat App!'))
        socket.broadcast.to(loginInfo.room).emit('message', generateMessage(`${loginInfo.username} has joined!`))

        socket.on('disconnect', () => {
            io.emit('message', generateMessage(`${loginInfo.username} has left the room`))
    
        })

    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.emit('message', generateMessage(message))
        callback()

    })

    socket.on('sendLocation', (location, callback) => {

        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location Shared! Cheers')
    })


})


server.listen(port, () => console.log("App is listening on port " + port))