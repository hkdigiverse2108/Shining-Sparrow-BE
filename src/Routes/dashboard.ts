import express from 'express';
import { dashboardController } from '../controllers';
import { adminJWT } from '../helper';

const router = express.Router();

router.get('/',  adminJWT, dashboardController.dashboard);
router.get('/analytics', adminJWT, dashboardController.analytics);
router.get('/login-history', adminJWT, dashboardController.loginHistory);

export const dashboardRoute = router;
