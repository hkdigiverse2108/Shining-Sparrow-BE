const mongoose = require('mongoose');

const courseLessonSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    thumbnail: { type: String, default: null },
    videoLink: { type: String, default: null },
    duration: { type: String, default: null },
    priority: { type: Number, default: 0 },
    practiceMaterial: { type: String, default: null },
    lessonLock: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const courseLessonModel = mongoose.model('course-lesson', courseLessonSchema);
