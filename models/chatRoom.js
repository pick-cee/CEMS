const mongoose = require("mongoose")
const chatRoomSchema = new mongoose.Schema({
    participants: [{
        participantId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        participantName:{
            type: String,
            required: true
        },
    }],
    messages: [{
        message: { type: String},
        sender: {type: mongoose.Types.ObjectId},
        senderFullname: {type: String}
    }],

}, {timestamps: true})

module.exports = mongoose.model("Chat-Room", chatRoomSchema)