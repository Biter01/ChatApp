//Express
const express = require('express');
const router = express.Router();
//Mongo DB
const User = require('../models/user');
//Module for to blocked routes
const checkPermission = require('../middleware/checkPermission');


//parses json body -> payload in order to read it -> req.body
router.use(express.json());


router.post('/', checkPermission, (req, res)=> {
    res.json({status: 'ok', message: `Welcome ${req.username}.`});
});

router.post('/search-user',checkPermission, async (req, res) => {
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

router.post('/room', checkPermission, async (req, res)=> {
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


router.get('/get-history', async (req, res)=> {
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


router.delete('/delete-history', async (req, res)=> {
    //console.log('tst');
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

module.exports = router;