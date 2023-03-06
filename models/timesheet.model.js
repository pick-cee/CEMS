const mongoose = require("mongoose")

const timesheetSchema = new mongoose.Schema({
    empId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    hoursWorked: {
        type: Number,
        required: true
    },
    tasksCompleted: [{
        type: String
    }]
}, {timestamps: true})

module.exports = mongoose.model("Timesheet", timesheetSchema)