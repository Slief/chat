const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server) 


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
    console.log('New webSocket connection')
    socket.emit('message', 'Welcome new user')              //  socket.emit just goes to the sender
    socket.broadcast.emit('message', 'A new user joined')   // sends to everyone EXCEPT the sender

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Bad words are not allowed')
        }

        io.emit('message', message)                         // io.emit goes to each connection
        callback()

    })
    
    socket.on('sendLocation', (coords, callback) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })


    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })
    
    // socket.emit('countUpdated', count)


    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)
    // })
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}!`)
})