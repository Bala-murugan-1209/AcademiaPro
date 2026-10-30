import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import Examination from '../models/Examination.js';
import Result from '../models/Result.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      recentStudents,
      departmentEnrollment,
      recentAttendance,
      recentResults,
    ] = await Promise.all([
      Student.countDocuments({ status: 'ACTIVE' }),
      Faculty.countDocuments({ status: 'ACTIVE' }),
      Course.countDocuments({ status: 'ACTIVE' }),
      Department.countDocuments({ status: 'ACTIVE' }),
      User.find({ role: 'STUDENT' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt'),
      Student.aggregate([
        { $match: { status: 'ACTIVE' } },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        { $group: { _id: '$dept.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      Attendance.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('student', 'rollNumber')
        .populate('subject', 'name')
        .select('status date createdAt'),
      Result.find({ isPublished: true })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('student', 'rollNumber')
        .populate('subject', 'name')
        .select('obtainedMarks maxMarks grade updatedAt'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalFaculty,
          totalCourses,
          totalDepartments,
        },
        departmentEnrollment,
        recentStudents,
        recentAttendance,
        recentResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyDashboard = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.user.facultyProfile)
      .populate('department', 'name')
      .populate({
        path: 'assignedSubjects',
        populate: { path: 'course', select: 'name code' },
      });

    if (!faculty) throw new AppError('Faculty profile not found.', 404);

    const subjectIds = faculty.assignedSubjects.map((s) => s._id);

    const [assignedStudentsCount, todayAttendanceCount, recentAttendance] = await Promise.all([
      Enrollment.countDocuments({
        course: { $in: faculty.assignedSubjects.map((s) => s.course?._id).filter(Boolean) },
        status: 'ACTIVE',
      }),
      Attendance.countDocuments({
        faculty: faculty._id,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Attendance.find({ faculty: faculty._id })
        .sort({ date: -1 })
        .limit(5)
        .populate('student', 'rollNumber')
        .populate('subject', 'name'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        faculty,
        stats: {
          assignedSubjects: faculty.assignedSubjects.length,
          assignedStudentsCount,
          todayAttendanceCount,
        },
        recentAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.studentProfile)
      .populate('department', 'name')
      .populate('course', 'name code totalSemesters');

    if (!student) throw new AppError('Student profile not found.', 404);

    const enrollments = await Enrollment.find({ student: student._id, status: 'ACTIVE' })
      .populate('course', 'name code');

    // Calculate attendance percentage
    const totalClasses = await Attendance.countDocuments({ student: student._id });
    const attendedClasses = await Attendance.countDocuments({
      student: student._id,
      status: { $in: ['PRESENT', 'LATE'] },
    });
    const attendancePercentage = totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;

    const recentResults = await Result.find({ student: student._id, isPublished: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('subject', 'name code')
      .populate('examination', 'name examDate');

    res.status(200).json({
      success: true,
      data: {
        student,
        enrollments,
        stats: {
          totalClasses,
          attendedClasses,
          attendancePercentage,
          enrolledCourses: enrollments.length,
        },
        recentResults,
      },
    });
  } catch (error) {
    next(error);
  }
};
