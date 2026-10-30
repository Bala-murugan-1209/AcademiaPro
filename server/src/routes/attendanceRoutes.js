import express from 'express';
import {
  markAttendanceBatch,
  getAttendanceBySubjectAndDate,
  getStudentAttendance,
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.post('/batch', authorize('ADMIN', 'FACULTY'), markAttendanceBatch);
router.get('/class-sheet', authorize('ADMIN', 'FACULTY'), getAttendanceBySubjectAndDate);
router.get('/student/:studentId', getStudentAttendance);

export default router;
