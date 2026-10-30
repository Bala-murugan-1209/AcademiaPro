import express from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  submitExamResults,
  publishExamResults,
  getStudentResults,
} from '../controllers/examController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/', authorize('ADMIN', 'FACULTY'), createExam);
router.put('/:id', authorize('ADMIN', 'FACULTY'), updateExam);
router.delete('/:id', authorize('ADMIN'), deleteExam);

router.post('/results/submit', authorize('ADMIN', 'FACULTY'), submitExamResults);
router.patch('/:id/publish', authorize('ADMIN', 'FACULTY'), publishExamResults);
router.get('/student/:studentId/results', getStudentResults);

export default router;
