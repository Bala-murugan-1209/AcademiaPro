import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Subject from '../models/Subject.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export const getFacultyList = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { search, department, status } = req.query;

    let filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
        role: 'FACULTY',
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      const matchingFaculty = await Faculty.find({ employeeId: searchRegex }).select('_id');
      const facultyIds = matchingFaculty.map((f) => f._id);

      const facultyFromUsers = await Faculty.find({ user: { $in: userIds } }).select('_id');
      const allFacultyIds = [...new Set([
        ...facultyIds.map((id) => id.toString()),
        ...facultyFromUsers.map((f) => f._id.toString()),
      ])];

      filter._id = { $in: allFacultyIds };
    }

    const [facultyList, total] = await Promise.all([
      Faculty.find(filter)
        .populate('user', 'name email accountStatus lastLogin')
        .populate('department', 'name code')
        .populate({
          path: 'assignedSubjects',
          populate: { path: 'course', select: 'name code' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Faculty.countDocuments(filter),
    ]);

    res.status(200).json(paginatedResponse(facultyList, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createFaculty = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      assignedSubjects,
      phone,
      qualification,
      specialization,
      joiningDate,
      address,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) throw new AppError('A user with this email already exists.', 409);

    const existingEmp = await Faculty.findOne({ employeeId: employeeId.toUpperCase().trim() });
    if (existingEmp) throw new AppError('Faculty with this Employee ID already exists.', 409);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'FACULTY',
    });

    const faculty = await Faculty.create({
      user: user._id,
      employeeId: employeeId.toUpperCase().trim(),
      department,
      assignedSubjects: assignedSubjects || [],
      phone,
      qualification,
      specialization,
      joiningDate: joiningDate || new Date(),
      address,
    });

    await User.findByIdAndUpdate(user._id, { facultyProfile: faculty._id });

    if (assignedSubjects && assignedSubjects.length > 0) {
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { $addToSet: { assignedFaculty: faculty._id } }
      );
    }

    const populated = await Faculty.findById(faculty._id)
      .populate('user', 'name email accountStatus')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'name email accountStatus lastLogin createdAt')
      .populate('department', 'name code description')
      .populate({
        path: 'assignedSubjects',
        populate: { path: 'course', select: 'name code' },
      });

    if (!faculty) throw new AppError('Faculty not found', 404);

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      qualification,
      specialization,
      address,
      department,
      assignedSubjects,
      status,
    } = req.body;

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) throw new AppError('Faculty not found', 404);

    if (name) {
      await User.findByIdAndUpdate(faculty.user, { name });
    }

    if (phone !== undefined) faculty.phone = phone;
    if (qualification !== undefined) faculty.qualification = qualification;
    if (specialization !== undefined) faculty.specialization = specialization;
    if (address !== undefined) faculty.address = address;
    if (department) faculty.department = department;
    if (status) {
      faculty.status = status;
      await User.findByIdAndUpdate(faculty.user, {
        accountStatus: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      });
    }

    if (assignedSubjects !== undefined) {
      // Unlink removed subjects
      await Subject.updateMany(
        { assignedFaculty: faculty._id, _id: { $nin: assignedSubjects } },
        { $pull: { assignedFaculty: faculty._id } }
      );
      // Link newly added subjects
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { $addToSet: { assignedFaculty: faculty._id } }
      );
      faculty.assignedSubjects = assignedSubjects;
    }

    await faculty.save();

    const populated = await Faculty.findById(faculty._id)
      .populate('user', 'name email accountStatus')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
