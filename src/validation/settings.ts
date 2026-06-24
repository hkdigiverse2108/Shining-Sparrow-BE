import Joi from "joi";

export const addEditSettingsSchema = Joi.object().keys({
    logo: Joi.string().allow('', null).optional(),
    razorpayKey: Joi.string().allow('', null).optional(),
    razorpaySecret: Joi.string().allow('', null).optional(),
    enrolledLearners: Joi.number().default(0),
    classCompleted: Joi.number().default(0),
    satisfactionRate: Joi.number().default(0),
});

