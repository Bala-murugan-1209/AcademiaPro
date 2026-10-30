import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import { AppError } from '../middleware/errorHandler.js';

export const getCourses = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    // Fetch counts for all courses in parallel aggregations instead of N+1 roundtrips
    const [subjectCounts, studentCounts] = await Promise.all([
      Subject.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
      ]),
    ]);

    const subjectMap = Object.fromEntries(subjectCounts.map((s) => [s._id?.toString(), s.count]));
    const studentMap = Object.fromEntries(studentCounts.map((st) => [st._id?.toString(), st.count]));

    const coursesWithCounts = courses.map((course) => {
      const cObj = course.toObject();
      const idStr = course._id.toString();
      cObj.subjectCount = subjectMap[idStr] || 0;
      cObj.studentCount = studentMap[idStr] || 0;
      return cObj;
    });

    res.status(200).json({
      success: true,
      data: coursesWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('department', 'name code');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const subjects = await Subject.find({ course: course._id })
      .populate({
        path: 'assignedFaculty',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ semester: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        course,
        subjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { name, code, department, program, duration, totalSemesters, credits, description } = req.body;

    const existingCode = await Course.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new AppError('Course code already exists', 409);
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      department,
      program,
      duration,
      totalSemesters,
      credits,
      description,
    });

    const populated = await Course.findById(course._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { name, code, department, program, duration, totalSemesters, credits, description, status } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (code && code.toUpperCase() !== course.code) {
      const existing = await Course.findOne({ code: code.toUpperCase() });
      if (existing) {
        throw new AppError('Course code already exists', 409);
      }
      course.code = code.toUpperCase();
    }

    if (name) course.name = name;
    if (department) course.department = department;
    if (program !== undefined) course.program = program;
    if (duration) course.duration = duration;
    if (totalSemesters) course.totalSemesters = totalSemesters;
    if (credits !== undefined) course.credits = credits;
    if (description !== undefined) course.description = description;
    if (status) course.status = status;

    await course.save();

    const populated = await Course.findById(course._id).populate('department', 'name code');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const hasStudents = await Student.exists({ course: course._id });
    if (hasStudents) {
      course.status = 'INACTIVE';
      await course.save();
      return res.status(200).json({
        success: true,
        message: 'Course has enrolled students. Marked as INACTIVE instead.',
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
