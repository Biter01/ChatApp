const User = require('../models/user.js');
const express = require('express');
const router = express.Router();
//bcrypt hash Passwords;
const bcrypt = require('bcryptjs');
//parses json body -> payload in order to read it -> req.body
router.use(express.json());


router.post('/', async (req, res) => {
    const {username, password: passwordString} = req.body;
    // console.log(req.body);
    //erlaube alle Zeichen von a-z und 0-9 die mit a-z oder 0-9 aufhören und anfangen und zwischen 2 und 20 Zeichen lang sind
    const regex = new RegExp('^[a-zA-Z0-9]{2,20}$');
    if(!username || typeof username !== 'string' || !regex.test(username)) {
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

module.exports = router;