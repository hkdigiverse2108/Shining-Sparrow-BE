const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    questionText: { type: String, required: true },
    questionImage: { type: String, default: null },
    questionAudio: { type: String, default: null },
    questionType: { type: String, enum: ['calculation', 'image', 'audio', 'text'], required: true },
    correctAnswer: { type: String, required: true },
    score: { type: Number, default: 1 },
    priority: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const questionModel = mongoose.model('question', questionSchema);
