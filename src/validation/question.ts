import Joi from "joi";

export const addQuestionSchema = Joi.object().keys({
    courseId: Joi.string().required(),
    questionText: Joi.string().required(),
    questionImage: Joi.string().allow('', null).optional(),
    questionAudio: Joi.string().allow('', null).optional(),
    questionType: Joi.string().valid('calculation', 'image', 'audio', 'text').required(),
    correctAnswer: Joi.string().required(),
    score: Joi.number().default(1),
    priority: Joi.number().default(0),
})

export const editQuestionSchema = Joi.object().keys({
    questionId: Joi.string().required(),
    courseId: Joi.string().optional(),
    questionText: Joi.string().optional(),
    questionImage: Joi.string().allow('', null).optional(),
    questionAudio: Joi.string().allow('', null).optional(),
    questionType: Joi.string().valid('calculation', 'image', 'audio', 'text').optional(),
    correctAnswer: Joi.string().optional(),
    score: Joi.number().optional(),
    priority: Joi.number().optional(),
})

export const deleteQuestionSchema = Joi.object().keys({
    id: Joi.string().required(),
})

export const getQuestionSchema = Joi.object().keys({
    id: Joi.string().required(),
})
