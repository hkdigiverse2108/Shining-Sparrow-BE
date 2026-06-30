var mongoose = require('mongoose')

const adminLoginHistorySchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    ipAddress: { type: String, default: '' },
    device: { type: String, default: '' },
    browser: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const adminLoginHistoryModel = mongoose.model('admin_login_history', adminLoginHistorySchema)
