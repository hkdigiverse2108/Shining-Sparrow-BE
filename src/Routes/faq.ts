import express from 'express';
import { faqController } from '../controllers';
import { adminJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, faqController.add_faq);
router.post('/edit', adminJWT, faqController.edit_faq_by_id);
router.delete('/delete/:id', adminJWT, faqController.delete_faq_by_id);
router.get('/all', userJWTOptional, faqController.get_all_faq);
router.get('/:id', userJWTOptional, faqController.get_faq_by_id);

export const faqRoute = router;

