import Joi from "joi";
import { USER_ROLES } from "../common";

export const signUpSchema = Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email().max(35).required(),
    password: Joi.string().required(),
    phone: Joi.string().pattern(/^\d{10}$/).optional(),
    designation: Joi.string().optional(),
});

export const loginSchema = Joi.object().keys({
    userType: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.USER).default(USER_ROLES.USER),
    email: Joi.string().email().max(35).when('userType', {
        is: USER_ROLES.ADMIN,
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    password: Joi.string().when('userType', {
        is: USER_ROLES.ADMIN,
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).when('userType', {
        is: USER_ROLES.USER,
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    otr: Joi.string().pattern(/^\d{8}$/).when('userType', {
        is: USER_ROLES.USER,
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
});

export const resetPasswordSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    newPassword: Joi.string().required(),
});

export const resendOTPSchema = Joi.object().keys({
    email: Joi.string().email().required(),
});

export const otpVerifySchema = Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required(),
});

export const forgotPasswordSchema = Joi.object().keys({
    email: Joi.string().email().required(),
});

export const forgotOtrSchema = Joi.object().keys({
    email: Joi.string().email().max(35).required(),
});

export const changePasswordSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
});

export const updateProfileSchema = Joi.object().keys({
    fullName: Joi.string().optional(),
    phone: Joi.string().optional(),
    designation: Joi.string().optional(),
    profilePhoto: Joi.string().allow('', null).optional(),
    district: Joi.string().allow('', null).optional(),
    std: Joi.string().allow('', null).optional(),
    reachFrom: Joi.string().allow('', null).optional(),
    schoolName: Joi.string().allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
});

export const deleteUserAccountSchema = Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    reason: Joi.string().required(),
    rate: Joi.number().integer().min(1).max(10).required(),
});