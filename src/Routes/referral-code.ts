import express from 'express';
import { referralCodeController } from '../controllers';
import { adminJWT, userJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, referralCodeController.add_referral_code);
router.post('/edit', adminJWT, referralCodeController.edit_referral_code_by_id);
router.delete('/delete/:id', adminJWT, referralCodeController.delete_referral_code_by_id);
router.get('/all', userJWTOptional, referralCodeController.get_all_referral_codes);
router.get('/:id', userJWTOptional, referralCodeController.get_referral_code_by_id);
router.post('/validate', userJWT, referralCodeController.validate_referral_code);

export const referralCodeRoute = router;

