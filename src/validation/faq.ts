import Joi from "joi";
import { FAQ_STATUS } from "../common";

const questionSchema = Joi.object().keys({
    en: Joi.string().required(),
    hi: Joi.string().allow('', null).optional(),
    gu: Joi.string().allow('', null).optional(),
})

const answerSchema = Joi.object().keys({
    en: Joi.string().required(),
    hi: Joi.string().allow('', null).optional(),
    gu: Joi.string().allow('', null).optional(),
})

export const addFaqSchema = Joi.object().keys({
    question: questionSchema.required(),
    answer: answerSchema.required(),
    learningCatalogId: Joi.string().optional(),
    isFeatured: Joi.boolean().default(false),
    type: Joi.string().valid(...Object.values(FAQ_STATUS)),
    isBlocked: Joi.boolean().default(false).optional(),
})

export const editFaqSchema = Joi.object().keys({
    faqId: Joi.string().required(),
    question: questionSchema.optional(),
    answer: answerSchema.optional(),
    learningCatalogId: Joi.string().optional(),
    isFeatured: Joi.boolean().default(false),
    type: Joi.string().valid(...Object.values(FAQ_STATUS)).optional(),
    isBlocked: Joi.boolean().optional(),
})

export const deleteFaqSchema = Joi.object().keys({
    id: Joi.string().required(),
})

export const getFaqSchema = Joi.object().keys({
    id: Joi.string().required(),
})
