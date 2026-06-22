const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-room', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    message: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const chatMessageModel = mongoose.model('chat-message', chatMessageSchema);
