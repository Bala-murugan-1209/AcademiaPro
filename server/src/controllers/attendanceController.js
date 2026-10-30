import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Faculty from '../models/Faculty.js';
import { AppError } from '../middleware/errorHandler.js';

export const markAttendanceBatch = async (req, res, next) => {
  try {
    const { subject, course, date, records } = req.body;

    if (!subject || !course || !date || !Array.isArray(records) || records.length === 0) {
      throw new AppError('Subject, course, date, and attendance records are required.', 400);
    }

    // Determine faculty ID: if logged in as faculty, use their facultyProfile
    let facultyId = req.user.role === 'FACULTY' ? req.user.facultyProfile : req.body.faculty;
    if (!facultyId) {
      // Find default faculty assigned to this subject
      const sub = await Subject.findById(subject);
      if (sub && sub.assignedFaculty && sub.assignedFaculty.length > 0) {
        facultyId = sub.assignedFaculty[0];
      } else {
        const anyFaculty = await Faculty.findOne();
        facultyId = anyFaculty?._id;
      }
    }

    const attendanceDate = new Date(date);
    // Normalize date to midnight UTC/day start so unique index on (student, subject, date) is consistent
    attendanceDate.setHours(0, 0, 0, 0);

    const operations = records.map((rec) => {
      return Attendance.findOneAndUpdate(
        {
          student: rec.student,
          subject,
          date: attendanceDate,
        },
        {
          student: rec.student,
          subject,
          course,
          faculty: facultyId,
          date: attendanceDate,
          status: rec.status,
          remarks: rec.remarks || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    const results = await Promise.all(operations);

    res.status(200).json({
      success: true,
      message: `Marked attendance for ${results.length} students.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceBySubjectAndDate = async (req, res, next) => {
  try {
    const { subject, date } = req.query;
    if (!subject || !date) {
      throw new AppError('Subject and date are required query parameters.', 400);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Attendance.find({
      subject,
      date: { $gte: attendanceDate, $lt: nextDay },
    }).populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    let studentId = req.params.studentId;

    if (req.user.role === 'STUDENT') {
      studentId = req.user.studentProfile;
    }

    const { subject, startDate, endDate } = req.query;
    let query = { student: studentId };

    if (subject) query.subject = subject;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('subject', 'name code')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    // Group stats by subject
    const subjectStatsMap = {};
    records.forEach((r) => {
      const sId = r.subject?._id?.toString() || 'unknown';
      const sName = r.subject?.name || 'Unknown';
      const sCode = r.subject?.code || '';
      if (!subjectStatsMap[sId]) {
        subjectStatsMap[sId] = {
          subjectId: sId,
          subjectName: sName,
          subjectCode: sCode,
          total: 0,
          attended: 0,
          absent: 0,
        };
      }
      subjectStatsMap[sId].total += 1;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        subjectStatsMap[sId].attended += 1;
      } else {
        subjectStatsMap[sId].absent += 1;
      }
    });

    const subjectStats = Object.values(subjectStatsMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        records,
        summary: {
          total,
          present,
          late,
          absent,
          percentage,
        },
        subjectStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
