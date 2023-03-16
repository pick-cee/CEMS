const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    senderFullname: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    chatRoomId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
}, {timestamps: true})

module.exports = mongoose.model("Message", messageSchema)