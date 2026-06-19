const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    courseLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'course-lesson' },
    title: { type: String, required: true },
    description: { type: String },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'question' }],
    passingMarks: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    timeLimit: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const examModel = mongoose.model('exam', examSchema);
