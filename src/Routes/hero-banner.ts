import express from 'express';
import { heroBannerController } from '../controllers';
import { adminJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, heroBannerController.add_hero_banner);
router.post('/edit', adminJWT, heroBannerController.edit_hero_banner_by_id);
router.delete('/delete/:id', adminJWT, heroBannerController.delete_hero_banner_by_id);
router.get('/all', userJWTOptional, heroBannerController.get_all_hero_banner);
router.get('/:id', userJWTOptional, heroBannerController.get_hero_banner_by_id);

export const heroBannerRoute = router;

