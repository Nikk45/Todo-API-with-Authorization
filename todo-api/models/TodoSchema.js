const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todo = new Schema({
    title: {
        type: String,
        require: true
    },
    isCompleted: {
        type: Boolean,
        require: true
    },
    dateTime: {
        type: Date,
        require: true,
        default: new Date()
    },
    username: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('todos',todo);