import express from 'express';
import { examController } from '../controllers';
import { adminJWT, userJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, examController.add_exam);
router.post('/edit', adminJWT, examController.edit_exam_by_id);
router.delete('/delete/:id', adminJWT, examController.delete_exam_by_id);
router.get('/all', userJWTOptional, examController.get_all_exams);
router.get('/attempts', userJWT, examController.get_user_attempts);
router.get('/:id', userJWTOptional, examController.get_exam_by_id);
router.post('/submit', userJWT, examController.submit_exam);

export const examRoute = router;