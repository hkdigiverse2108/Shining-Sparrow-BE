import express from 'express';
import { questionController } from '../controllers';
import { adminJWT, userJWT } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, questionController.add_question);
router.post('/edit', adminJWT, questionController.edit_question_by_id);
router.delete('/delete/:id', adminJWT, questionController.delete_question_by_id);
router.get('/all', userJWT, questionController.get_all_questions);

export const questionRoute = router;
