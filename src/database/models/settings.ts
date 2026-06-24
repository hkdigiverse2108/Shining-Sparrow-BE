const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    logo: { type: String },
    razorpayKey: { type: String },
    razorpaySecret: { type: String },
    enrolledLearners: { type: Number, default: 0 },
    classCompleted: { type: Number, default: 0 },
    satisfactionRate: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const settingsModel = mongoose.model('settings', settingsSchema);

