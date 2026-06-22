import Joi from "joi";

export const sendMessageSchema = Joi.object().keys({
    roomId: Joi.string().hex().length(24).optional(),
    message: Joi.string().required().min(1).max(5000),
});

export const getMessagesSchema = Joi.object().keys({
    roomId: Joi.string().hex().length(24).required(),
});

export const createRoomSchema = Joi.object().keys({
    recipientId: Joi.string().hex().length(24).optional(),
});
