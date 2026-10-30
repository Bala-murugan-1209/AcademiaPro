import User from '../models/User.js';
import Student from '../models/Student.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse, buildSearchFilter, generateUniqueId } from '../utils/helpers.js';

export const getStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { search, department, course, semester, status } = req.query;

    let filter = {};
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (semester) filter.currentSemester = parseInt(semester);
    if (status) filter.status = status;

    let studentIds;
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      // Search in user (name, email) and student (rollNumber)
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
        role: 'STUDENT',
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      const matchingStudents = await Student.find({
        $or: [{ rollNumber: searchRegex }, { registrationNumber: searchRegex }],
      }).select('_id');
      const directStudentIds = matchingStudents.map((s) => s._id);

      // Get student documents where user is in matchingUsers
      const studentsFromUsers = await Student.find({ user: { $in: userIds } }).select('_id');
      studentIds = [...new Set([
        ...directStudentIds.map((id) => id.toString()),
        ...studentsFromUsers.map((s) => s._id.toString()),
      ])];
      filter._id = { $in: studentIds };
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('user', 'name email accountStatus lastLogin')
        .populate('department', 'name code')
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(filter),
    ]);

    res.status(200).json(paginatedResponse(students, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const {
      name, email, password, rollNumber, registrationNumber,
      department, course, currentSemester, phone, dateOfBirth,
      address, guardianName, guardianPhone, enrollmentDate,
    } = req.body;

    // Check for duplicate email/roll number
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) throw new AppError('A user with this email already exists.', 409);

    const existingStudent = await Student.findOne({ rollNumber: rollNumber.toUpperCase().trim() });
    if (existingStudent) throw new AppError('A student with this roll number already exists.', 409);

    // Create user account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'STUDENT',
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      rollNumber: rollNumber.toUpperCase().trim(),
      registrationNumber: registrationNumber?.toUpperCase().trim(),
      department,
      course,
      currentSemester: parseInt(currentSemester),
      phone,
      dateOfBirth: dateOfBirth || null,
      address,
      guardianName,
      guardianPhone,
      enrollmentDate: enrollmentDate || new Date(),
    });

    // Link profile to user
    await User.findByIdAndUpdate(user._id, { studentProfile: student._id });

    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email accountStatus')
      .populate('department', 'name code')
      .populate('course', 'name code');

    res.status(201).json({ success: true, data: populatedStudent });
  } catch (error) {
    next(error);
  }
};

export const getStudent = async (req, res, next) => {
  try {
    // Students can only view their own profile
    if (req.user.role === 'STUDENT') {
      const myStudent = await Student.findById(req.user.studentProfile);
      if (!myStudent || myStudent._id.toString() !== req.params.id) {
        throw new AppError('Access denied.', 403);
      }
    }

    const student = await Student.findById(req.params.id)
      .populate('user', 'name email accountStatus lastLogin createdAt')
      .populate('department', 'name code description')
      .populate('course', 'name code program duration totalSemesters');

    if (!student) throw new AppError('Student not found.', 404);

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const {
      name, phone, address, guardianName, guardianPhone,
      currentSemester, department, course, dateOfBirth,
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) throw new AppError('Student not found.', 404);

    // Students can only update their own limited fields
    if (req.user.role === 'STUDENT') {
      if (student._id.toString() !== req.user.studentProfile?.toString()) {
        throw new AppError('Access denied.', 403);
      }
      // Students can only update contact info
      await User.findByIdAndUpdate(student.user, { name: name || undefined });
      student.phone = phone || student.phone;
      student.address = address || student.address;
      await student.save();
    } else {
      // Admin can update all fields
      if (name) await User.findByIdAndUpdate(student.user, { name });
      if (phone !== undefined) student.phone = phone;
      if (address !== undefined) student.address = address;
      if (guardianName !== undefined) student.guardianName = guardianName;
      if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
      if (currentSemester) student.currentSemester = parseInt(currentSemester);
      if (department) student.department = department;
      if (course) student.course = course;
      if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth || null;
      await student.save();
    }

    const updated = await Student.findById(req.params.id)
      .populate('user', 'name email accountStatus')
      .populate('department', 'name code')
      .populate('course', 'name code');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}.`, 400);
    }

    const student = await Student.findById(req.params.id);
    if (!student) throw new AppError('Student not found.', 404);

    student.status = status;
    await student.save();

    // Sync user account status
    const accountStatus = status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    await User.findByIdAndUpdate(student.user, { accountStatus });

    res.status(200).json({ success: true, message: `Student status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
};
