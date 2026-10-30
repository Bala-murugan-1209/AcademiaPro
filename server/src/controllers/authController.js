import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { AppError } from '../middleware/errorHandler.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Load profile ref
    let profile = null;
    if (user.role === 'STUDENT' && user.studentProfile) {
      profile = await Student.findById(user.studentProfile)
        .populate('department', 'name code')
        .populate('course', 'name code');
    } else if (user.role === 'FACULTY' && user.facultyProfile) {
      profile = await Faculty.findById(user.facultyProfile)
        .populate('department', 'name code');
    }

    const userData = user.toJSON();
    if (profile) userData.profile = profile;

    const token = generateToken(user._id);
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    };
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'STUDENT' && user.studentProfile) {
      profile = await Student.findById(user.studentProfile)
        .populate('department', 'name code')
        .populate('course', 'name code');
    } else if (user.role === 'FACULTY' && user.facultyProfile) {
      profile = await Faculty.findById(user.facultyProfile)
        .populate('department', 'name code')
        .populate('assignedSubjects', 'name code');
    }

    const userData = user.toJSON();
    if (profile) userData.profile = profile;

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required.', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters long.', 400);
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 401);
    }

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'STUDENT',
      department,
      course,
      currentSemester = 1,
      rollNumber,
      employeeId,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required.', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const validRoles = ['STUDENT', 'FACULTY', 'ADMIN'];
    const assignedRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'STUDENT';

    let deptDoc = null;
    if (department) {
      if (mongoose.isValidObjectId(department)) {
        deptDoc = await Department.findById(department);
      }
      if (!deptDoc) {
        deptDoc = await Department.findOne({
          $or: [
            { code: department.toUpperCase().trim() },
            { name: new RegExp(`^${department.trim()}$`, 'i') },
          ],
        });
      }
      // If still not found, check known catalog and create on-the-fly
      if (!deptDoc) {
        const deptKey = department.toUpperCase().trim();
        const catalogEntry = {
          CSE: { name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science & Engineering' },
          AIDS: { name: 'Artificial Intelligence & Data Science', code: 'AIDS', description: 'Department of Artificial Intelligence & Data Science' },
          IT: { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
          ECE: { name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Department of Electronics & Communication Engineering' },
          EEE: { name: 'Electrical & Electronics Engineering', code: 'EEE', description: 'Department of Electrical & Electronics Engineering' },
          ME: { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
          CE: { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering' },
          AE: { name: 'Aerospace Engineering', code: 'AE', description: 'Department of Aerospace Engineering' },
          BME: { name: 'Biomedical Engineering', code: 'BME', description: 'Department of Biomedical Engineering' },
          CHE: { name: 'Chemical Engineering', code: 'CHE', description: 'Department of Chemical Engineering' },
          SMS: { name: 'School of Management Studies', code: 'SMS', description: 'School of Management Studies' },
        }[deptKey];

        if (catalogEntry) {
          deptDoc = await Department.create(catalogEntry);
        }
      }
    }
    if (!deptDoc) {
      deptDoc = await Department.findOne({ status: 'ACTIVE' });
    }

    let courseDoc = null;
    if (assignedRole === 'STUDENT') {
      if (course) {
        if (mongoose.isValidObjectId(course)) {
          courseDoc = await Course.findById(course);
        }
        if (!courseDoc) {
          courseDoc = await Course.findOne({
            $or: [
              { code: course.toUpperCase().trim() },
              { name: new RegExp(`^${course.trim()}$`, 'i') },
            ],
          });
        }
        if (!courseDoc) {
          const courseKey = course.toUpperCase().trim();
          const courseCatalog = {
            'BTECH-CSE': { name: 'B.Tech in Computer Science & Engineering', code: 'BTECH-CSE', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-AIDS': { name: 'B.Tech in Artificial Intelligence & Data Science', code: 'BTECH-AIDS', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-IT': { name: 'B.Tech in Information Technology', code: 'BTECH-IT', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-ECE': { name: 'B.Tech in Electronics & Communication', code: 'BTECH-ECE', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-EEE': { name: 'B.Tech in Electrical & Electronics Engineering', code: 'BTECH-EEE', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-ME': { name: 'B.Tech in Mechanical Engineering', code: 'BTECH-ME', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-CE': { name: 'B.Tech in Civil Engineering', code: 'BTECH-CE', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-AE': { name: 'B.Tech in Aerospace Engineering', code: 'BTECH-AE', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-BME': { name: 'B.Tech in Biomedical Engineering', code: 'BTECH-BME', duration: 4, totalSemesters: 8, credits: 160 },
            'BTECH-CHE': { name: 'B.Tech in Chemical Engineering', code: 'BTECH-CHE', duration: 4, totalSemesters: 8, credits: 160 },
            'MBA': { name: 'Master of Business Administration (MBA)', code: 'MBA', duration: 2, totalSemesters: 4, credits: 100 },
          }[courseKey];

          if (courseCatalog) {
            courseDoc = await Course.create({
              ...courseCatalog,
              department: deptDoc?._id,
              program: courseKey === 'MBA' ? 'Postgraduate' : 'Undergraduate',
            });
          }
        }
      }
      if (!courseDoc && deptDoc) {
        courseDoc = await Course.findOne({ department: deptDoc._id, status: 'ACTIVE' });
      }
      if (!courseDoc) {
        courseDoc = await Course.findOne({ status: 'ACTIVE' });
      }
    }

    const deptId = deptDoc?._id;
    const courseId = courseDoc?._id;

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password,
      role: assignedRole,
      accountStatus: 'ACTIVE',
    });

    let profile = null;

    if (assignedRole === 'STUDENT') {
      const generatedRoll = rollNumber?.toUpperCase().trim() || `STU${Date.now().toString().slice(-6)}`;
      const existingRoll = await Student.findOne({ rollNumber: generatedRoll });
      const finalRoll = existingRoll ? `STU${Date.now().toString().slice(-6)}` : generatedRoll;

      const student = await Student.create({
        user: user._id,
        rollNumber: finalRoll,
        registrationNumber: `REG-${finalRoll}`,
        department: deptId,
        course: courseId,
        currentSemester: parseInt(currentSemester) || 1,
        phone: phone || '',
        enrollmentDate: new Date(),
      });

      user.studentProfile = student._id;
      await user.save({ validateBeforeSave: false });

      if (courseId) {
        await Enrollment.create({
          student: student._id,
          course: courseId,
          semester: parseInt(currentSemester) || 1,
          status: 'ACTIVE',
          remarks: 'Self-registered student account',
        }).catch(() => {});
      }

      profile = await Student.findById(student._id)
        .populate('department', 'name code')
        .populate('course', 'name code');
    } else if (assignedRole === 'FACULTY') {
      const generatedEmp = employeeId?.toUpperCase().trim() || `EMP${Date.now().toString().slice(-5)}`;
      const existingEmp = await Faculty.findOne({ employeeId: generatedEmp });
      const finalEmp = existingEmp ? `EMP${Date.now().toString().slice(-5)}` : generatedEmp;

      const faculty = await Faculty.create({
        user: user._id,
        employeeId: finalEmp,
        department: deptId,
        phone: phone || '',
        joiningDate: new Date(),
      });

      user.facultyProfile = faculty._id;
      await user.save({ validateBeforeSave: false });

      profile = await Faculty.findById(faculty._id)
        .populate('department', 'name code');
    }

    const userData = user.toJSON();
    if (profile) userData.profile = profile;

    const token = generateToken(user._id);
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    };
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

