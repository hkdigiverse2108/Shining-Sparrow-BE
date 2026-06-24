import express from 'express';
import { workshopController } from '../controllers';
import { adminJWT, userJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, workshopController.add_workshop);
router.post('/edit', adminJWT, workshopController.edit_workshop_by_id);
router.delete('/delete/:id', adminJWT, workshopController.delete_workshop_by_id);
router.get('/all', userJWTOptional, workshopController.get_all_workshop);
router.get('/my-workshops', userJWT, workshopController.get_my_workshops);
router.post('/purchase', userJWT, workshopController.purchase_workshop);
router.get('/:id', userJWTOptional, workshopController.get_workshop_by_id);

export const workshopRoute = router;

