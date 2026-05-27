import express from 'express';
import { getAllUsers, saveFeedback, saveReport } from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/feedback', saveFeedback);
router.post('/report', saveReport);

export default router;
