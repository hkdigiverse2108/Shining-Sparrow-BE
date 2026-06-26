import Joi from "joi";

export const addCourseSchema = Joi.object().keys({
    name: Joi.string().required(),
    courseCurriculumIds: Joi.array().items(Joi.string()).optional(),
    courseLessonIds: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow('', null).optional(),
    price: Joi.number().default(0),
    mrpPrice: Joi.number().default(0),
    language: Joi.string().allow('', null).optional(),
    image: Joi.string().allow('', null).optional(),
    pdf: Joi.string().allow('', null).optional(),
    purchasedCoursesShow: Joi.boolean().default(false),
    enrolledLearners: Joi.number().default(0),
    duration: Joi.number().default(0),
    classCompleted: Joi.number().default(0),
    satisfactionRate: Joi.number().default(0),
    accessDurationDays: Joi.number().allow(null).optional().default(null),
    isBlocked: Joi.boolean().default(false).optional(),
    trailerUrl: Joi.string().allow('', null).optional().default(null),
    isFeatured: Joi.boolean().default(false).optional(),
    priority: Joi.number().default(0).optional(),
});

export const editCourseSchema = Joi.object().keys({
    courseId: Joi.string().required(),
    name: Joi.string().optional(),
    courseCurriculumIds: Joi.array().items(Joi.string()).optional(),
    courseLessonIds: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow('', null).optional(),
    price: Joi.number().optional(),
    mrpPrice: Joi.number().default(0),
    language: Joi.string().allow('', null).optional(),
    image: Joi.string().allow('', null).optional(),
    pdf: Joi.string().allow('', null).optional(),
    purchasedCoursesShow: Joi.boolean().optional(),
    enrolledLearners: Joi.number().optional(),
    duration: Joi.number().default(0),
    classCompleted: Joi.number().optional(),
    satisfactionRate: Joi.number().optional(),
    accessDurationDays: Joi.number().allow(null).optional(),
    isBlocked: Joi.boolean().optional(),
    trailerUrl: Joi.string().allow('', null).optional(),
    isFeatured: Joi.boolean().optional(),
    priority: Joi.number().optional(),
});

export const deleteCourseSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
});

export const getCourseSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
});

export const purchaseCourseSchema = Joi.object().keys({
    courseId: Joi.string().required(),
    razorpayOrderId: Joi.string().optional(),
    razorpayPaymentId: Joi.string().optional(),
});

