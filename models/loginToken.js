const mongoose = require("mongoose")

const loginToken = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    code: {
        type: String,
        required: true,
    },
    expiresIn: {
        type: Date,
        default: new Date().getTime() + 600000,
    }
}, {timestamps: true})

module.exports = mongoose.model("LoginToken", loginToken)