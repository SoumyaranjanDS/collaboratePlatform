import express from 'express';
import { getAdminUsers, getAdminFeedback, getAdminReports, warnUser, emailBlast } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/users', getAdminUsers);
router.get('/feedback', getAdminFeedback);
router.get('/reports', getAdminReports);
router.post('/warn', warnUser);
router.post('/email-blast', emailBlast);

export default router;
