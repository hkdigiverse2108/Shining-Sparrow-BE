import express from 'express';
import { workshopCurriculumController } from '../controllers';
import { adminJWT, userJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, workshopCurriculumController.add_workshop_curriculum);
router.post('/edit', adminJWT, workshopCurriculumController.edit_workshop_curriculum_by_id);
router.delete('/delete/:id', adminJWT, workshopCurriculumController.delete_workshop_curriculum_by_id);
router.post('/complete', userJWT, workshopCurriculumController.complete_workshop_curriculum);
router.get('/progress/:workshopId', userJWT, workshopCurriculumController.get_workshop_progress);
router.get('/all', userJWTOptional, workshopCurriculumController.get_all_workshop_curriculum);
router.get('/:id', userJWTOptional, workshopCurriculumController.get_workshop_curriculum_by_id);

export const workshopCurriculumRoute = router;

