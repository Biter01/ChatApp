const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkPermission = require('./middleware/checkPermission');

// const http = require('http');
// const server = http.createServer(app);
// const io = require("socket.io")(server);

const JWT_SECRET = 'sd*23jd3$h"w234!234l?ejk4rh';

mongoose.connect('mongodb://localhost:27017/chat-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


//Settings
app.set('view engine', 'ejs');
app.set('views', './views');

//Set view enginge standard Folder
app.use(express.static(__dirname + '/public'));
//parses json body -> payload in order to read it -> req.body
app.use(bodyParser.json());



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
        const response = await User.create({
            username: username,
            password: password
        });
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
                id: user._id, username: user.username
            },
            JWT_SECRET
        );

        return res.json({status: 'ok', message: 'Sucessfully logged in', data: token});
    }

    return res.json({status: 'error', message: 'Invalid User/Password'});
    
});

app.post('/api/chat' ,checkPermission, (req, res)=> {
    res.json({status: 'ok', message: req.username});
});

app.post('/api/chat/search-user', checkPermission, async (req, res) => {
    const {username} = req.body;
    //console.log(username);
    //Suche user mithile von find hier kann man einfach Reguläre Ausdrücke verwenden!!
    let users = await User.find({username: new RegExp(`${username}`, "i") }, 'username').lean();
    users = users.slice(0, 5);
    users = users.filter((user)=> {
        return user.username !== req.username;
    });
    res.json({status: 'ok', users: users});
});

app.listen(5000, ()=> {
    console.log('Server Listening Port 5000');
});
