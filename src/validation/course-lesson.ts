import Joi from "joi";

export const addCourseLessonSchema = Joi.object().keys({
    courseId: Joi.string().required(),
    title: Joi.string().required(),
    subtitle: Joi.string().allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
    thumbnail: Joi.string().allow('', null).optional(),
    videoLink: Joi.string().allow('', null).optional(),
    duration: Joi.string().allow('', null).optional(),
    priority: Joi.number().optional(),
    practiceMaterial: Joi.string().allow('', null).optional(),
    lessonLock: Joi.boolean().default(false),
})

export const editCourseLessonSchema = Joi.object().keys({
    courseLessonId: Joi.string().required(),
    courseId: Joi.string().optional(),
    title: Joi.string().optional(),
    subtitle: Joi.string().allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
    thumbnail: Joi.string().allow('', null).optional(),
    videoLink: Joi.string().allow('', null).optional(),
    duration: Joi.string().allow('', null).optional(),
    priority: Joi.number().optional(),
    practiceMaterial: Joi.string().allow('', null).optional(),
    lessonLock: Joi.boolean().optional(),
})

export const deleteCourseLessonSchema = Joi.object().keys({
    id: Joi.string().required(),
})

export const getCourseLessonSchema = Joi.object().keys({
    id: Joi.string().required(),
})
