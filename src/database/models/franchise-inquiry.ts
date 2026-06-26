const mongoose = require('mongoose');

const franchiseInquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    investmentBudget: { type: String },
    occupation: { type: String },
    message: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    replySubject: { type: String },
    replyMessage: { type: String },
    repliedAt: { type: Date },
    isReplied: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const franchiseInquiryModel = mongoose.model('franchise-inquiry', franchiseInquirySchema);
