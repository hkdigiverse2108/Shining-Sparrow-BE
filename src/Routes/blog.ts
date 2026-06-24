import express from 'express';
import { blogController } from '../controllers';
import { adminJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, blogController.add_blog);
router.post('/edit', adminJWT, blogController.edit_blog_by_id);
router.delete('/delete/:id', adminJWT, blogController.delete_blog_by_id);
router.get('/all', userJWTOptional, blogController.get_all_blog);
router.get('/:id', userJWTOptional, blogController.get_blog_by_id);

export const blogRoute = router;
