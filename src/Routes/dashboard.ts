import express from 'express';
import { dashboardController } from '../controllers';
import { adminJWT } from '../helper';

const router = express.Router();

router.get('/',  adminJWT, dashboardController.dashboard);
router.get('/analytics', adminJWT, dashboardController.analytics);
router.get('/login-history', adminJWT, dashboardController.loginHistory);
router.delete('/login-history/:id', adminJWT, dashboardController.deleteLoginHistory);
router.post('/login-history/block/:id', adminJWT, dashboardController.blockDevice);
router.post('/login-history/unblock/:id', adminJWT, dashboardController.unblockDevice);

export const dashboardRoute = router;
