import express from 'express';
import {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/faculty', authorize('FACULTY'), getFacultyDashboard);
router.get('/student', authorize('STUDENT'), getStudentDashboard);

export default router;
