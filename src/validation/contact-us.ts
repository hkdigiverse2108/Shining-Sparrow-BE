import Joi from "joi";

export const addEditContactUsSchema = Joi.object().keys({
    phoneNumbers: Joi.array().items(Joi.object().keys({
        number: Joi.string().required(),
        label: Joi.string().allow('', null).optional(),
    })).optional(),
    email: Joi.string().email().allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
    workingHours: Joi.string().allow('', null).optional(),
    socialMediaLinks: Joi.object().keys({
        facebook: Joi.string().allow('', null).optional(),
        twitter: Joi.string().allow('', null).optional(),
        instagram: Joi.string().allow('', null).optional(),
        linkedin: Joi.string().allow('', null).optional(),
    }).optional(),
});
