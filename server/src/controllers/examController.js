import Examination from '../models/Examination.js';
import Result from '../models/Result.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import { AppError } from '../middleware/errorHandler.js';

export const getExams = async (req, res, next) => {
  try {
    const { course, semester, subject, isPublished } = req.query;
    let query = {};

    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);
    if (subject) query.subject = subject;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const exams = await Examination.find(query)
      .populate('course', 'name code')
      .populate('subject', 'name code')
      .populate('createdBy', 'name')
      .sort({ examDate: -1 });

    const examIds = exams.map((e) => e._id);
    const resultCounts = await Result.aggregate([
      { $match: { examination: { $in: examIds } } },
      { $group: { _id: '$examination', count: { $sum: 1 } } },
    ]);
    const resultMap = Object.fromEntries(resultCounts.map((r) => [r._id?.toString(), r.count]));

    const examsWithStats = exams.map((exam) => {
      const obj = exam.toObject();
      obj.resultCount = resultMap[exam._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: examsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const exam = await Examination.findById(req.params.id)
      .populate('course', 'name code')
      .populate('subject', 'name code')
      .populate('createdBy', 'name');

    if (!exam) {
      throw new AppError('Examination not found', 404);
    }

    const results = await Result.find({ examination: exam._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ 'student.rollNumber': 1 });

    res.status(200).json({
      success: true,
      data: {
        exam,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const { name, subject, course, semester, examDate, maxMarks, examType } = req.body;

    const exam = await Examination.create({
      name,
      subject,
      course,
      semester: parseInt(semester),
      examDate,
      maxMarks: parseFloat(maxMarks),
      examType: examType || 'OTHER',
      createdBy: req.user._id,
    });

    const populated = await Examination.findById(exam._id)
      .populate('course', 'name code')
      .populate('subject', 'name code');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const { name, subject, course, semester, examDate, maxMarks, examType } = req.body;

    const exam = await Examination.findById(req.params.id);
    if (!exam) throw new AppError('Examination not found', 404);

    if (name) exam.name = name;
    if (subject) exam.subject = subject;
    if (course) exam.course = course;
    if (semester) exam.semester = parseInt(semester);
    if (examDate) exam.examDate = examDate;
    if (maxMarks) exam.maxMarks = parseFloat(maxMarks);
    if (examType) exam.examType = examType;

    await exam.save();

    const populated = await Examination.findById(exam._id)
      .populate('course', 'name code')
      .populate('subject', 'name code');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Examination.findById(req.params.id);
    if (!exam) throw new AppError('Examination not found', 404);

    await Result.deleteMany({ examination: exam._id });
    await Examination.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Examination and its results deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const submitExamResults = async (req, res, next) => {
  try {
    const { examinationId, results } = req.body;

    if (!examinationId || !Array.isArray(results) || results.length === 0) {
      throw new AppError('Examination ID and results array are required', 400);
    }

    const exam = await Examination.findById(examinationId);
    if (!exam) throw new AppError('Examination not found', 404);

    const savedResults = [];
    for (const item of results) {
      const obtainedMarks = parseFloat(item.obtainedMarks);
      if (obtainedMarks > exam.maxMarks) {
        throw new AppError(
          `Obtained marks (${obtainedMarks}) cannot exceed maximum marks (${exam.maxMarks})`,
          400
        );
      }

      // Calculate grade
      const percentage = (obtainedMarks / exam.maxMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      const resDoc = await Result.findOneAndUpdate(
        { student: item.student, examination: exam._id },
        {
          student: item.student,
          examination: exam._id,
          subject: exam.subject,
          obtainedMarks,
          maxMarks: exam.maxMarks,
          grade,
          isPublished: exam.isPublished,
          remarks: item.remarks || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      savedResults.push(resDoc);
    }

    res.status(200).json({
      success: true,
      message: `Saved ${savedResults.length} student results.`,
      data: savedResults,
    });
  } catch (error) {
    next(error);
  }
};

export const publishExamResults = async (req, res, next) => {
  try {
    const { isPublished } = req.body;
    const exam = await Examination.findById(req.params.id);
    if (!exam) throw new AppError('Examination not found', 404);

    exam.isPublished = Boolean(isPublished);
    exam.publishedAt = isPublished ? new Date() : null;
    await exam.save();

    await Result.updateMany(
      { examination: exam._id },
      { isPublished: Boolean(isPublished) }
    );

    res.status(200).json({
      success: true,
      message: `Results ${isPublished ? 'published' : 'unpublished'} successfully.`,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    let studentId = req.params.studentId;
    if (req.user.role === 'STUDENT') {
      studentId = req.user.studentProfile;
    }

    const query = { student: studentId };
    if (req.user.role === 'STUDENT') {
      query.isPublished = true;
    }

    const results = await Result.find(query)
      .populate('examination', 'name examDate examType semester isPublished')
      .populate('subject', 'name code credits')
      .sort({ 'examination.examDate': -1 });

    // Calculate overall statistics
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    results.forEach((r) => {
      totalMarksObtained += r.obtainedMarks;
      totalMaxMarks += r.maxMarks;
    });

    const overallPercentage = totalMaxMarks > 0
      ? Math.round((totalMarksObtained / totalMaxMarks) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        results,
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};
