import express from 'express';
import { courseLessonController } from '../controllers';
import { adminJWT, userJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, courseLessonController.add_course_lesson);
router.post('/edit', adminJWT, courseLessonController.edit_course_lesson_by_id);
router.delete('/delete/:id', adminJWT, courseLessonController.delete_course_lesson_by_id);
router.post('/complete', userJWT, courseLessonController.complete_lesson);
router.get('/all', userJWTOptional, courseLessonController.get_all_course_lessons);
router.get('/:id', userJWTOptional, courseLessonController.get_course_lesson_by_id);

export const courseLessonRoute = router;
