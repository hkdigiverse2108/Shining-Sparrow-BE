const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    courseCurriculumIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    courseLessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course-lesson' }],
    description: { type: String },
    price: { type: Number, default: 0 },
    mrpPrice: { type: Number, default: 0 },
    language: { type: String, default: null },
    image: { type: String },
    pdf: { type: String },
    duration: { type: Number, default: 0 },
    purchasedCoursesShow: { type: Boolean, default: false },
    enrolledLearners: { type: Number, default: 0 },
    classCompleted: { type: Number, default: 0 },
    satisfactionRate: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    accessDurationDays: { type: Number, default: null },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const courseModel = mongoose.model('course', courseSchema);