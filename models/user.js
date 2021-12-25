const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    chatrooms: [{
        roomname: {type: String},
        onlinestatus: {type: Boolean},
        unreadmessages: {type: Number}, 
        history: [String]
    }]
}, {collection: 'users'});

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;

