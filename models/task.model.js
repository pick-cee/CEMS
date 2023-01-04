const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    empId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['incomplete', 'complete'],
        default: 'incomplete'
    }
}, {timestamps: true})

module.exports = mongoose.model('task', taskSchema)