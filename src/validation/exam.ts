import Joi from "joi";

const newQuestionSchema = Joi.object().keys({
    questionText: Joi.string().required(),
    questionImage: Joi.string().allow('', null).optional(),
    questionAudio: Joi.string().allow('', null).optional(),
    questionType: Joi.string().valid('calculation', 'image', 'audio', 'text').required(),
    correctAnswer: Joi.string().required(),
    score: Joi.number().default(1),
    priority: Joi.number().default(0),
})

export const addExamSchema = Joi.object().keys({
    courseId: Joi.string().required(),
    courseLessonId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().allow('', null).optional(),
    questionIds: Joi.array().items(Joi.string()).optional(),
    newQuestions: Joi.array().items(newQuestionSchema).optional(),
    passingMarks: Joi.number().required(),
    totalMarks: Joi.number().required(),
    timeLimit: Joi.number().required(),
})

export const editExamSchema = Joi.object().keys({
    examId: Joi.string().required(),
    courseId: Joi.string().optional(),
    courseLessonId: Joi.string().optional(),
    title: Joi.string().optional(),
    description: Joi.string().allow('', null).optional(),
    questionIds: Joi.array().items(Joi.string()).optional(),
    newQuestions: Joi.array().items(newQuestionSchema).optional(),
    passingMarks: Joi.number().optional(),
    totalMarks: Joi.number().optional(),
    timeLimit: Joi.number().optional(),
})

export const deleteExamSchema = Joi.object().keys({
    id: Joi.string().required(),
})

export const getExamSchema = Joi.object().keys({
    id: Joi.string().required(),
})

export const submitExamSchema = Joi.object().keys({
    examId: Joi.string().required(),
    answers: Joi.array().items(Joi.object().keys({
        questionId: Joi.string().required(),
        answer: Joi.string().allow('', null).required(),
    })).required(),
    timeTaken: Joi.number().required(),
})
