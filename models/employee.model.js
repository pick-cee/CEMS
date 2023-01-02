const mongoose = require("mongoose")

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    department: {
        type: String,
    },
    lastLogin: {
        type: Date,
    }
}, {timestamps: true})

module.exports = mongoose.model("Employee", employeeSchema)