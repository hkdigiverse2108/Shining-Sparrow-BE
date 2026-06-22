const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    type: { type: String, enum: ['global', 'personal'], required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const chatRoomModel = mongoose.model('chat-room', chatRoomSchema);
