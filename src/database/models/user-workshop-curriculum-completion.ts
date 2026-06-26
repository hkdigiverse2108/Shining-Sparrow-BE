const mongoose = require('mongoose');

const userWorkshopCurriculumCompletionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'workshop', required: true },
    workshopCurriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'workshop-curriculum', required: true },
}, { timestamps: true, versionKey: false });

userWorkshopCurriculumCompletionSchema.index({ userId: 1, workshopCurriculumId: 1 }, { unique: true });

export const userWorkshopCurriculumCompletionModel = mongoose.model('user-workshop-curriculum-completion', userWorkshopCurriculumCompletionSchema);
