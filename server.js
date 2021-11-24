const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const http = require('http');
// const server = http.createServer(app);
// const io = require("socket.io")(server);

const JWT_SECRET = 'sd*23jd3$h"w234!234l?ejk4rh';

mongoose.connect('mongodb://localhost:27017/chat-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));
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
        console.log(response)
        
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
    console.log(username, password)
    const user = await User.findOne({username: username}).lean();
    console.log(user);
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


app.post('/api/chat', (req, res)=> {
    try{
        console.log(req.body);
        const {token} = req.body;
        console.log(token);
        const user = jwt.verify(token, JWT_SECRET);
        var username = user.username;
    } catch(err) {
        console.log(err);
       return res.json({status: 'error', message: 'You are not logged in!'})
    }
    res.json({status: 'ok', message: username});
});



app.listen(5000, ()=> {
    console.log('Server Listening Port 5000');
});