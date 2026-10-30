import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Public: list courses (used during registration & public discovery)
router.get('/', getCourses);

// Protected routes below
router.use(authenticate);

router.get('/:id', getCourseById);
router.post('/', authorize('ADMIN'), createCourse);
router.put('/:id', authorize('ADMIN'), updateCourse);
router.delete('/:id', authorize('ADMIN'), deleteCourse);

export default router;
