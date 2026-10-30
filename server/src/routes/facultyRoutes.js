import express from 'express';
import {
  getFacultyList,
  createFaculty,
  getFacultyById,
  updateFaculty,
} from '../controllers/facultyController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'FACULTY'), getFacultyList);
router.post('/', authorize('ADMIN'), createFaculty);
router.get('/:id', getFacultyById);
router.put('/:id', authorize('ADMIN'), updateFaculty);

export default router;
