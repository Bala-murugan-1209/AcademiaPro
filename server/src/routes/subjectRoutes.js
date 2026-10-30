import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Public: list subjects for discovery, syllabus, and course enrollment
router.get('/', getSubjects);

router.use(authenticate);

router.get('/:id', getSubjectById);
router.post('/', authorize('ADMIN'), createSubject);
router.put('/:id', authorize('ADMIN'), updateSubject);
router.delete('/:id', authorize('ADMIN'), deleteSubject);

export default router;
