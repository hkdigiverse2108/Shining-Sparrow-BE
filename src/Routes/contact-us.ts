import express from 'express';
import { contactUsController } from '../controllers';
import { adminJWT } from '../helper';

const router = express.Router();

router.post('/add-edit', adminJWT, contactUsController.add_edit_contact_us);
router.get('/all', contactUsController.get_contact_us);

export const contactUsRoute = router;
