import express from 'express';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollmentStatus,
} from '../controllers/enrollmentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getEnrollments);
router.post('/', authorize('ADMIN'), createEnrollment);
router.patch('/:id/status', authorize('ADMIN'), updateEnrollmentStatus);

export default router;
