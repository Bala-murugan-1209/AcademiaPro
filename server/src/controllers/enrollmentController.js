import Enrollment from '../models/Enrollment.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { AppError } from '../middleware/errorHandler.js';

export const getEnrollments = async (req, res, next) => {
  try {
    const { student, course, semester, status } = req.query;
    let query = {};

    if (student) query.student = student;
    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('course', 'name code duration totalSemesters')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (req, res, next) => {
  try {
    const { student, course, semester, remarks } = req.body;

    const existing = await Enrollment.findOne({ student, course, status: 'ACTIVE' });
    if (existing) {
      throw new AppError('Student is already actively enrolled in this course', 409);
    }

    const enrollment = await Enrollment.create({
      student,
      course,
      semester: parseInt(semester) || 1,
      remarks: remarks || '',
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('course', 'name code');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const valid = ['ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED'];
    if (!valid.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${valid.join(', ')}`, 400);
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) throw new AppError('Enrollment not found', 404);

    enrollment.status = status;
    if (remarks !== undefined) enrollment.remarks = remarks;
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};
