import Joi from "joi";

export const addUserSchema = Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email().max(35).required(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).required(),
    password: Joi.string().optional(),
    profilePhoto: Joi.string().allow('', null).optional(),
    designation: Joi.string().optional(),
    referralCode: Joi.string().allow('', null).optional(),
    district: Joi.string().allow('', null).optional(),
    std: Joi.string().allow('', null).optional(),
    reachFrom: Joi.string().allow('', null).optional(),
    schoolName: Joi.string().allow('', null).optional(),
    agreeTerms: Joi.boolean().default(false),
    isEmailVerified: Joi.boolean().default(false),
    isBlocked: Joi.boolean().default(false),
});

export const editUserSchema = Joi.object().keys({
    userId: Joi.string().required(),
    fullName: Joi.string().optional(),
    email: Joi.string().email().max(35).optional(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).optional(),
    profilePhoto: Joi.string().allow('', null).optional(),
    designation: Joi.string().optional(),
    referralCode: Joi.string().allow('', null).optional(),
    district: Joi.string().allow('', null).optional(),
    std: Joi.string().allow('', null).optional(),
    reachFrom: Joi.string().allow('', null).optional(),
    schoolName: Joi.string().allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
    agreeTerms: Joi.boolean().optional(),
    isEmailVerified: Joi.boolean().optional(),
    isBlocked: Joi.boolean().optional(),
});

export const deleteUserSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
});

export const getUserSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
});

export const purchaseIntentSchema = Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email().max(35).required(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).required(),
    courseId: Joi.string().hex().length(24).optional(),
    workshopId: Joi.string().hex().length(24).optional(),
    district: Joi.string().allow('', null).optional(),
    std: Joi.string().allow('', null).optional(),
    reachFrom: Joi.string().allow('', null).optional(),
});
