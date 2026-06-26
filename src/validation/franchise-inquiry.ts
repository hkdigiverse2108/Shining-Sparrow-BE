import Joi from "joi";

export const addFranchiseInquirySchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    investmentBudget: Joi.string().allow('', null).optional(),
    occupation: Joi.string().allow('', null).optional(),
    message: Joi.string().allow('', null).optional(),
});

export const editFranchiseInquirySchema = Joi.object().keys({
    franchiseInquiryId: Joi.string().required(),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    investmentBudget: Joi.string().allow('', null).optional(),
    occupation: Joi.string().allow('', null).optional(),
    message: Joi.string().allow('', null).optional(),
    isRead: Joi.boolean().optional(),
});

export const deleteFranchiseInquirySchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getFranchiseInquirySchema = Joi.object().keys({
    id: Joi.string().required(),
});
