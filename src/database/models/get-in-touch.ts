const mongoose = require('mongoose');

const getInTouchSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    subject: { type: String },
    message: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    replySubject: { type: String },
    replyMessage: { type: String },
    repliedAt: { type: String },
}, { timestamps: true, versionKey: false });

export const getInTouchModel = mongoose.model('get-in-touch', getInTouchSchema);

