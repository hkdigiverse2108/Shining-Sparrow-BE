import express from 'express';
import { chatController } from '../controllers';
import { userJWT } from '../helper';
import { sendMessageSchema, createRoomSchema } from '../validation/chat';
import { apiResponse } from '../common';

const router = express.Router();

const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(new apiResponse(400, error?.details[0]?.message, {}, {}));
    next();
};

router.post('/send', userJWT, validateBody(sendMessageSchema), chatController.send_message);
router.get('/rooms', userJWT, chatController.get_rooms);
router.get('/messages/:roomId', userJWT, chatController.get_messages);
router.post('/room/create', userJWT, validateBody(createRoomSchema), chatController.create_room);

export const chatRoute = router;
