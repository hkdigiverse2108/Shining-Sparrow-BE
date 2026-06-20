import express from 'express';
import { notificationController } from '../controllers';
import { userJWT } from '../helper';

const router = express.Router();

router.get('/all', userJWT, notificationController.get_all_notifications);
router.post('/read', userJWT, notificationController.mark_read);
router.post('/delete', userJWT, notificationController.delete_notification);

export const notificationRoute = router;
