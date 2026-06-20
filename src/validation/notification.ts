import Joi from "joi";

export const getNotificationSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
});
