const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    phoneNumbers: [{
        number: { type: String, required: true },
        label: { type: String, default: 'General' },
    }],
    email: { type: String },
    address: { type: String },
    workingHours: { type: String },
    socialMediaLinks: {
        facebook: { type: String, default: null },
        twitter: { type: String, default: null },
        instagram: { type: String, default: null },
        linkedin: { type: String, default: null },
    },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const contactUsModel = mongoose.model('contact-us', contactUsSchema);