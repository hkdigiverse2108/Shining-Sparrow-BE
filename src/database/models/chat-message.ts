const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-room', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    message: { type: String, required: true },
    attachment: {
        url: { type: String },
        type: { type: String, enum: ['image', 'pdf', 'doc'] },
        name: { type: String },
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-message', default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const chatMessageModel = mongoose.model('chat-message', chatMessageSchema);
