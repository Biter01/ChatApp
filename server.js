const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user.js')
//const HistoryUser = require('./models/historyUsers.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkPermission = require('./middleware/checkPermission');
const path = require('path');

//Web Sockets Libary
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server)



const JWT_SECRET = 'sd*23jd3$h"w234!234l?ejk4rh';

mongoose.connect('mongodb://localhost:27017/chat-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


//Settings
app.set('view engine', 'ejs');
app.set('views', './views');

//Suse static files
app.use(express.static(__dirname + '/public'));
//parses json body -> payload in order to read it -> req.body
app.use(express.json());



app.post('/api/register', async (req, res) => {
    const {username, password: passwordString} = req.body;
    // console.log(req.body);

    if(!username || typeof username !== 'string' || !isNaN(username)) {
        return res.json({status: 'error', message: 'Invalid username'});
    }

    if(!passwordString || typeof passwordString !== 'string') {
        return res.json({status: 'error', message: 'Invalid password'});
    }

    const password = await bcrypt.hash(passwordString, 10);
    //console.log(password);
    try {
        // console.log('Before create User')
        const response = await User.create({
            username: username,
            password: password,
            chatrooms: []
        });

        // console.log('After create User');
        //console.log(response)
        
     } catch (error) {
        if(error.code === 11000) {
            return res.json({status: 'error', message: 'User already exists'});
        } else {
            throw error;
        }
    }

    res.json({status: 'ok', message: 'Scuessfully registered'});

});


app.post('/api/login', async (req, res)=> {
    const {username, password} = req.body;
    //console.log(username, password)
    const user = await User.findOne({username: username}).lean();
    //console.log(user);
    if(!user) {
        return res.json({status: 'error', message: 'Invalid User/Password'});
    }
 
    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({
                //exp setze ein exp Date für Token
                id: user._id, username: user.username, exp: Math.floor(Date.now() / 1000) + 3600 
            },
            JWT_SECRET
        );

        return res.json({status: 'ok', message: 'Sucessfully logged in', data: token});
    }

    return res.json({status: 'error', message: 'Invalid User/Password'});
    
});

app.post('/api/chat/checkPermission' , checkPermission, (req, res)=> {
    res.json({status: 'ok' ,userName: req.username, message: `Wilkommen ${req.username}.`});
});

app.get('/api/chat/search-user', async (req, res) => {
    const {searchedUser ,userName} = req.query;
    //console.log(username);
    //Suche user mithile von find hier kann man einfach Reguläre Ausdrücke verwenden!!
    let users = await User.find({username: new RegExp(`${searchedUser}`, "i") }, 'username').lean();
    //console.log(users)
    users = users.slice(0, 5);
    users = users.filter((user)=> {
        return user.username !== userName;
    });
    res.json({status: 'ok', users: users});
});


app.get('/chat/:userRoom',(req, res)=> {
    //console.log('test')
    const {userRoom} = req.params;
    res.sendFile(path.resolve(__dirname, './public/userRoom.html'));
});


app.post('/api/chat/room', checkPermission, async (req, res)=> {
    const {userRoom} = req.body;
    //Schaut in der Datenbank nach ob es zu diesen Raum einen User gibt
    const roomObj = await User.findOne({username: userRoom});
    const username = req.username;
        //console.log(user, room)
    //Wenn der Userroom nicht exestiert also es gibt keinen Namen mit diesen User in der Datenbank
    if(!roomObj) {
       return res.json({status: 'error', message: 'Username does not exist'});
    }
    // Wenn der User nicht mit dem Raum übereinstimmt und ein User zum chatten exestiert
    if(username !== roomObj.username && username) {
        res.json({status: 'ok', message: 'Everything is alright', username: username});
    }
    //Wenn der Raum  mit dem User übereinstimmt
    else if(username === roomObj.username) {
        res.json({status: 'error', message: 'You can not chat with yourself'});
    } else {
        res.json({status: 'error', message: 'ERROR!!!'});
    }
});


io.on('connection', (socket)=> {
    //console.log('a user connected'); 

    //Horcht auf Event das von *chat.js* geschickt wird nicht wie die anderen für userRoom.js
    socket.on('connect-user', (userName)=> {
        //console.log('connected-user');
        socket.join(userName);
    });


    socket.on('user-join', async (user)=> {
        const {userRoom, userName} = user;
        //Defeniere ein neues subdocument für den Sender, sofern es nicht exestiert
        const userSender = await User.findOne({username: userName});
        //console.log(user);
        let chatRoomSender = userSender.chatrooms.find((element)=> {return element.roomname === userRoom});
        if(!chatRoomSender) {
            //Defeniere ein neues Sub document, den es exestiert für diesen User keines mit dem roomname userRoom!!!
            //console.log('newRoom-Sender');
            //Der onlinestatus wird auf true gesetzt da der Schreiber in dem Raum online ist
            userSender.chatrooms.push({roomname: userRoom, onlinestatus: true, unreadmessages:0, history: []});
            const updatedUser = await userSender.save();
            //chatRoomSender wird neu gesetzt weil es am Anfang undefinded war und man jetzt Wert benötigt
            chatRoomSender = userSender.chatrooms.find((element)=> {return element.roomname === userRoom});
            //console.log(chatRoomSender);
            //In diesem Fall Funktionsaufruf da 
           
            
            //console.log(saveChatRoomSender);

            //console.log(updatedUser);
        } else {
            //Der Nutzer der einen UserRoom gejoined ist bekommt das Feld *onlinestatus* des jeweilgen UserRooms dem er gejoinded ist auf true gesetzt;
            // Sebastian joined den Raum Zazer dann wird bei ihm in dem Subdokument Zazer das Feld *onlinestatus* auf  true gesetzt
            chatRoomSender.onlinestatus = true;
            
        }

        console.log(chatRoomSender);
        //Wenn der Sender im UserRoom online ist,also in dem subdocument online auf true, setze *unreadmessages* zurück auf 0
        if(chatRoomSender.onlinestatus === true && chatRoomSender) {
            console.log('bin online');
            chatRoomSender.unreadmessages = 0;
        }
        const saveChatRoomSender = await userSender.save();

         //Defeniere ein neues subdocument für den Empfänger, sofern es nicht exestiert
         const userRecipient = await User.findOne({username: userRoom});
         const chatRoomRecipient = userRecipient.chatrooms.find((element)=> {return element.roomname === userName});

         if(!chatRoomRecipient) {
            //Defeniere ein neues Sub document, den es exestiert für diesen User keines mit dem roomname userName!!!
            //console.log('newRoom-Recipient');
            //Da der Nutzer der des userrooms jeztz noch nicht online ist, weil der UserRoom bei ihm noch gar nicht exestiert wrid der onlinestatus des Sender Subdocument auf false gesetzt, Wenn er Online ist wird der obrige Code ausgefürt
            userRecipient.chatrooms.push({roomname: userName, onlinestatus: false, unreadmessages:0 , history: []});
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
        //console.log('message sent');
        

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
            
            //Speichere Änderungen
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
            //Wenn das subdocument für den Empfänger gefunden wurde speichere die neue Nachricht darin
            chatRoomRecipient.history.push(`${userName}:${message}`);
            //Wenn der Empfänger nicht online ist zähle unreadMessages hoch, 
            //Also wenn in dem Subdocument des Empfängers onlinestauts auf false gesetzt ist
            if(chatRoomRecipient.onlinestatus === false) {
                
                chatRoomRecipient.unreadmessages += 1;
                //console.log(chatRoomSender.unreadmessages);
            }

            

            //Speichere Änderungen
            const updatedRecipient = await userRecipient.save();
            //console.log(updatedRecipient);
            //Schreibe alle änderungen raus wenn der Sender eine Nachricht gesendet hat, diese werden dann in chat.js angezeigt 
            //Man muss die ChatRooms des Resciepinet rausschreiben da man in diesem Fall der Empfänger ist
            //!!!Dieses Socket Event ist für chat.js und nicht wie die anderen für userRoom.js
            //console.log(userRoom);
            socket.to(userRoom).emit('update-userRooms', userRecipient.chatrooms);
            //console.log(updatedRecipient);
        }  else if(!chatRoomRecipient) {
            //wenn kein subdocument für den User gefunden wurde werfe einen Fehler
            throw Error;
        }

    });


    socket.on('update-onlinestatus', async (userName)=> {
        //Wähle den User aus und sete alle Rooms auf onlinestauts false
        const userSender = await User.findOne({username: userName});
        userSender.chatrooms.forEach((chatRoomSender)=> {chatRoomSender.onlinestatus = false});
        const savedChange = await userSender.save();

        //Schreibe die neuen userrooms des Senders raus
        //console.log(userName, socket.rooms);
        //console.log(userSender.chatrooms);
        socket.emit('update-userRooms', userSender.chatrooms);
        //console.log(savedChange);
    });

    socket.on('disconnect',  async ()=> {
       
    });

});

app.get('/api/chat/get-history', async (req, res)=> {
    const {userName, userRoom} = req.query;
    //Findet den User und greift auf dessen  ChatRoom zu, wo dann die history übergeben wird
    const user = await User.findOne({username: userName});
    const chatRoom = user.chatrooms.find((element)=>{return element.roomname === userRoom});
    //console.log(chatRoom);
    if(chatRoom) {
        return res.json({status: 'ok', history: chatRoom.history});
    } else {
        res.json({status: 'error', message: 'chatRoom does not exist'})
    }
});


app.delete('/api/chat/delete-history', async (req, res)=> {
    //console.log(req.body);
    const {userName, userRoom} = req.body;
    //Findet den User und greift auf dessen  ChatRoom zu, wo dann die history gelöscht wird
    const user = await User.findOne({username: userName});
    const chatRoom = user.chatrooms.find((element)=>{return element.roomname === userRoom});
    //console.log(user);
    if(chatRoom) {
        chatRoom.history = [];
        await user.save();
        return res.json({status: 'ok', message: 'History deleted'});
    } else {
        res.json({status: 'error', message: 'Cannot delete Room'});
    }

});


server.listen(5000, ()=> {
    console.log('Server Listening Port 5000');
});
