import Joi from "joi";

export const sendMessageSchema = Joi.object().keys({
    roomId: Joi.string().hex().length(24).optional(),
    message: Joi.string().optional().allow('').max(5000),
    attachment: Joi.object({
        url: Joi.string().uri().required(),
        type: Joi.string().valid('image', 'pdf', 'doc').required(),
        name: Joi.string().required(),
    }).optional(),
}).or('message', 'attachment');

export const getMessagesSchema = Joi.object().keys({
    roomId: Joi.string().hex().length(24).required(),
});

export const createRoomSchema = Joi.object().keys({
    recipientId: Joi.string().hex().length(24).optional(),
});
