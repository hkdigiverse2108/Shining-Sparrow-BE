import express from 'express';
import { testimonialController } from '../controllers';
import { adminJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, testimonialController.add_testimonial);
router.post('/edit', adminJWT, testimonialController.edit_testimonial_by_id);
router.delete('/delete/:id', adminJWT, testimonialController.delete_testimonial_by_id);
router.get('/all', userJWTOptional, testimonialController.get_all_testimonial);
router.get('/ratings/summary', userJWTOptional, testimonialController.get_all_testimonial_rating);
router.get('/:id', userJWTOptional, testimonialController.get_testimonial_by_id);

export const testimonialRoute = router;

