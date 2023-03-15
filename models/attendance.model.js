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
    },
    status: {
        type: String,
        enum: ['absent','present', 'late'],
        default: 'present'
    },
    location: {
        longitude: {
            type: String,
        },
        latitude: {
            type: String,
        },
    },
    address: {
        type: String
    }
}, {timestamps: true})

module.exports = mongoose.model('Attendance', attendanceSchema)