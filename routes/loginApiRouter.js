const User = require('../models/user.js')
const express = require('express');
const router = express.Router();
//JWT Tokens
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sa)skdlfj93!"845sadflasdf3438;';
//bcrypt hash Passwords;
const bcrypt = require('bcryptjs');
//parses json body -> payload in order to read it -> req.body
router.use(express.json());



router.post('/', async (req, res)=> {
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

module.exports = router;