import express from 'express';
import { trustedPartnerController } from '../controllers';
import { adminJWT, userJWTOptional } from '../helper';

const router = express.Router();

router.post('/add', adminJWT, trustedPartnerController.add_trusted_partner);
router.post('/edit', adminJWT, trustedPartnerController.edit_trusted_partner_by_id);
router.delete('/delete/:id', adminJWT, trustedPartnerController.delete_trusted_partner_by_id);
router.get('/all', userJWTOptional, trustedPartnerController.get_all_trusted_partner);
router.get('/:id', userJWTOptional, trustedPartnerController.get_trusted_partner_by_id);

export const trustedPartnerRoute = router;

