function checkPermission(req, res, next) {
    const jwt = require('jsonwebtoken');
    try{
        //console.log(req.body);
        const {token} = req.body;
        //console.log(token);
        //console.log(jwt);
        const user = jwt.verify(token, 'sd*23jd3$h"w234!234l?ejk4rh');
        var username = user.username;
    } catch(err) {
        console.log(err);
        return res.json({status: 'error', message: 'You are not permited to see the resources'});
    }
    req.username = username;
    next()
}

module.exports = checkPermission;