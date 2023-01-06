const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
    empId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    attendanceTime: {
        type: Date,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Attendance', attendanceSchema)