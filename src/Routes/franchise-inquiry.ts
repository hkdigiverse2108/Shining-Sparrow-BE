import express from 'express';
import { franchiseInquiryController } from '../controllers';

const router = express.Router();

router.post('/add', franchiseInquiryController.add_franchise_inquiry);
router.post('/edit', franchiseInquiryController.edit_franchise_inquiry_by_id);
router.delete('/delete/:id', franchiseInquiryController.delete_franchise_inquiry_by_id);
router.get('/all', franchiseInquiryController.get_all_franchise_inquiry);
router.get('/:id', franchiseInquiryController.get_franchise_inquiry_by_id);

export const franchiseInquiryRoute = router;
