const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    history: {type: String}
}, {collection: 'historyUsers'});

const model = mongoose.model('HistorySchema', HistorySchema);

module.exports = model;