const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' },
    answer: { type: String },
    isCorrect: { type: Boolean, default: false },
}, { _id: false });

const userExamAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'exam' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    courseLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'course-lesson' },
    answers: [answerSchema],
    obtainedMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    status: { type: String, enum: ['pass', 'fail'], default: 'fail' },
    attemptCount: { type: Number, default: 1 },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

userExamAttemptSchema.index({ userId: 1, examId: 1 }, { unique: true });

export const userExamAttemptModel = mongoose.model('user-exam-attempt', userExamAttemptSchema);
