import express from 'express';
import {
  getStudents,
  createStudent,
  getStudent,
  updateStudent,
  updateStudentStatus,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'FACULTY'), getStudents);
router.post('/', authorize('ADMIN'), createStudent);
router.get('/:id', getStudent); // Self check or Admin/Faculty handled in controller
router.put('/:id', updateStudent);
router.patch('/:id/status', authorize('ADMIN'), updateStudentStatus);

export default router;
