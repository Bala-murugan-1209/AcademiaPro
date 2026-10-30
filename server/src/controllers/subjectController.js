import Subject from '../models/Subject.js';
import Faculty from '../models/Faculty.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSubjects = async (req, res, next) => {
  try {
    const { course, semester, status, faculty } = req.query;
    let query = {};

    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;
    if (faculty) query.assignedFaculty = faculty;

    const subjects = await Subject.find(query)
      .populate('course', 'name code')
      .populate({
        path: 'assignedFaculty',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ semester: 1, code: 1 });

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('course', 'name code totalSemesters')
      .populate({
        path: 'assignedFaculty',
        populate: { path: 'user', select: 'name email' },
      });

    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, course, semester, credits, assignedFaculty, description } = req.body;

    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) {
      throw new AppError('Subject code already exists', 409);
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      course,
      semester: parseInt(semester),
      credits: credits ? parseInt(credits) : 3,
      assignedFaculty: assignedFaculty || [],
      description,
    });

    // If faculty assigned, also update Faculty.assignedSubjects
    if (assignedFaculty && assignedFaculty.length > 0) {
      await Faculty.updateMany(
        { _id: { $in: assignedFaculty } },
        { $addToSet: { assignedSubjects: subject._id } }
      );
    }

    const populated = await Subject.findById(subject._id)
      .populate('course', 'name code')
      .populate({
        path: 'assignedFaculty',
        populate: { path: 'user', select: 'name email' },
      });

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { name, code, course, semester, credits, assignedFaculty, description, status } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    if (code && code.toUpperCase() !== subject.code) {
      const existing = await Subject.findOne({ code: code.toUpperCase() });
      if (existing) {
        throw new AppError('Subject code already in use', 409);
      }
      subject.code = code.toUpperCase();
    }

    if (name) subject.name = name;
    if (course) subject.course = course;
    if (semester) subject.semester = parseInt(semester);
    if (credits !== undefined) subject.credits = parseInt(credits);
    if (description !== undefined) subject.description = description;
    if (status) subject.status = status;

    if (assignedFaculty !== undefined) {
      // Remove this subject from faculty no longer assigned
      await Faculty.updateMany(
        { assignedSubjects: subject._id, _id: { $nin: assignedFaculty } },
        { $pull: { assignedSubjects: subject._id } }
      );
      // Add to newly assigned faculty
      await Faculty.updateMany(
        { _id: { $in: assignedFaculty } },
        { $addToSet: { assignedSubjects: subject._id } }
      );
      subject.assignedFaculty = assignedFaculty;
    }

    await subject.save();

    const populated = await Subject.findById(subject._id)
      .populate('course', 'name code')
      .populate({
        path: 'assignedFaculty',
        populate: { path: 'user', select: 'name email' },
      });

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    // Remove reference from faculty
    await Faculty.updateMany(
      { assignedSubjects: subject._id },
      { $pull: { assignedSubjects: subject._id } }
    );

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
