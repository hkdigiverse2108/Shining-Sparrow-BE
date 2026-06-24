import express from 'express';
import { galleryController } from '../controllers';
import { adminJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, galleryController.add_gallery);
router.post('/edit', adminJWT, galleryController.edit_gallery_by_id);
router.delete('/delete/:id', adminJWT, galleryController.delete_gallery_by_id);
router.get('/all', userJWTOptional, galleryController.get_all_gallery);
router.get('/:id', userJWTOptional, galleryController.get_gallery_by_id);

export const galleryRoute = router;

