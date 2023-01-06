const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    empId: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        required: true
    },
    lengthOfLeave: {
        type: String,
        required: true
    },
    countOfLeaves: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['approved', 'declined', 'pending'],
        default: 'pending'
    }
}, {timestamps: true})

module.exports = mongoose.model('Leaves', leaveSchema)