//Express
const express = require('express');
const app = express();
//path
const path = require('path');
//Mongo DB
const mongoose = require('mongoose');
const User = require('./models/user.js')
//Socket io implementation
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
//Router
const registerApiRouter = require('./routes/registerApiRouter');
const loginApiRouter = require('./routes/loginApiRouter');
const chatApiRouter = require('./routes/chatApiRouter');
const dbURI = 'mongodb://localhost:27017/chat-app-db';
const port = process.env.PORT || 5000;

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use('/api/register', registerApiRouter)
app.use('/api/login', loginApiRouter);
app.use('/api/chat', chatApiRouter);

//Verwende static files
app.use(express.static(__dirname + '/public'));
//parses json body -> payload in order to read it -> req.body
app.use(express.json());

app.get('/chat/:userRoom', (req, res)=> {
    const {userRoom} = req.params;
    res.sendFile(path.resolve(__dirname, './public/userRoom.html'));
});

io.on('connection', (socket)=> {
    //console.log('a user connected'); 

    socket.on('user-join', async (user)=> {
        const {userRoom, userName} = user;
        //Defeniere ein neues subdocument für den Sender, sofern es nicht exestiert
        const userSender = await User.findOne({username: userName});
        //console.log(user);
        const chatRoomSender = userSender.chatrooms.find((element)=> {return element.roomname === userRoom});
        if(!chatRoomSender) {
            //Defeniere ein neues Sub document, den es exestiert für diesen User keines mit dem roomname userRoom!!!
            console.log('newRoom-Sender');
            
            userSender.chatrooms.push({roomname: userRoom, history: []});
            const updatedUser = await userSender.save();
            //console.log(updatedUser);
        }

         //Defeniere ein neues subdocument für den Empfänger, sofern es nicht exestiert
         const userRecipient = await User.findOne({username: userRoom});
         const chatRoomRecipient = userRecipient.chatrooms.find((element)=> {return element.roomname === userName});

         if(!chatRoomRecipient) {
            //Defeniere ein neues Sub document, den es exestiert für diesen User keines mit dem roomname userName!!!
            //console.log('newRoom-Recipient');
            userRecipient.chatrooms.push({roomname: userName, history: []});
            const updatedUser = await userRecipient.save();
            //console.log(updatedUser);
        }
        
        const room = `${userRoom}-${userName}`;

        socket.join(room);
    });

    socket.on('chat-message', (msgObj)=> {
        //console.log(JSON.stringify(msgObj));
        const {userRoom, userName, message} = msgObj;
            //console.log('server chat message');
        //schickt nachrict an alle Clients außer an sich selbst
        socket.broadcast.to(`${userName}-${userRoom}`).emit('send-message', message);
    });


    socket.on('save-history', async (msgObj)=> {
        const {userRoom, userName, message} = msgObj;

         //Speicere neue Nachrichten in das jeweilge subdocument des *Senders*, welches den roomname userRoom trägt.
        const userSender = await User.findOne({username: userName});
       
        const chatRoomSender = userSender.chatrooms.find((element)=> {return element.roomname === userRoom});
        if(chatRoomSender) {
            //console.log('updateRoom Sender');
            //Wenn das subdocument für den Sender gefunden wurde speichere die neue Nachricht darin
            chatRoomSender.history.push(`${userName}:${message}`);
            const updatedSender = await userSender.save();
            //console.log(updatedSender);
        } else if(!chatRoomSender) {
            //wenn kein subdocument für den User gefunden wurde werfe einen Fehler
            throw Error;
        }

        //Speicere neue Nachrichten in das jeweilge subdocument des *Empfängers*, welches den roomname userName trägt.
        const userRecipient = await User.findOne({username: userRoom});

        const chatRoomRecipient = userRecipient.chatrooms.find((element)=> {return element.roomname === userName});
        if(chatRoomRecipient) {
            //console.log('updateRoom Recipient');
            //Wenn das subdocument für den Empfaänger gefunden wurde speichere die neue Nachricht darin
            chatRoomRecipient.history.push(`${userName}:${message}`);
            const updatedRecipient = await userRecipient.save();
            //console.log(updatedRecipient);
        }  else if(!chatRoomRecipient) {
            //wenn kein subdocument für den User gefunden wurde werfe einen Fehler
            throw Error;
        }
    });

    socket.on('disconnect',  (user)=> {
        //console.log('user-disconnected')
    });

});

server.listen(port, ()=> {
    console.log('Server Listening Port 5000');
});
