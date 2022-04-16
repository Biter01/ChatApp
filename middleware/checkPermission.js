function checkPermission(req, res, next) {
    const jwt = require('jsonwebtoken');
    try{
        //console.log(req.body);
        const {token} = req.body;
        //console.log(token);
        //console.log(jwt);
        //überprüfe Token
        const user = jwt.verify(token, 'sa)skdlfj93!"845sadflasdf3438;');
        //Wenn das Token abgelaufen ist
        //console.log(user.exp, Date.now()/1000);
        if(user.exp < (Date.now()/1000)) {
            throw Error();
        } else {
            var username = user.username;
        }
        
    } catch(err) {
        //console.log(err);
        // return res.redirect('index.html')
        return res.status(403).json({status: 'error', message: 'You are not permitted to see the resources'});
    }
   
    req.username = username;
    next()
}

module.exports = checkPermission;