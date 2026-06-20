const mongoose = require('mongoose');

const userLessonCompletionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
    courseLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'course-lesson', required: true },
}, { timestamps: true, versionKey: false });

userLessonCompletionSchema.index({ userId: 1, courseLessonId: 1 }, { unique: true });

export const userLessonCompletionModel = mongoose.model('user-lesson-completion', userLessonCompletionSchema);
