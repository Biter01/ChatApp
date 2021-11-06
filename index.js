const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

// console.log(server);

app.get('/', (req, res)=> {
    res.sendFile(__dirname +'/index.html');
});


io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('chat-message', (msg)=> {
        console.log('server chat message');
        io.emit('chat-message', msg);
    });
    socket.on('disconnect', ()=> {
        console.log('disconnected');
        io.emit('user-left', 'User disconnected');
    });
});


console.log('after connection');

server.listen(3000, ()=> {
    console.log('listening on *:3000');
});