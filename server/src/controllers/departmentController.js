import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export const getDepartments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const departments = await Department.find(query)
      .populate({
        path: 'departmentHead',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ name: 1 });

    // Fetch counts for all departments in parallel aggregations instead of N+1 roundtrips
    const [courseCounts, facultyCounts, studentCounts] = await Promise.all([
      Course.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
      Faculty.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
    ]);

    const courseMap = Object.fromEntries(courseCounts.map((c) => [c._id?.toString(), c.count]));
    const facultyMap = Object.fromEntries(facultyCounts.map((f) => [f._id?.toString(), f.count]));
    const studentMap = Object.fromEntries(studentCounts.map((s) => [s._id?.toString(), s.count]));

    const departmentsWithCounts = departments.map((dept) => {
      const deptObj = dept.toObject();
      const idStr = dept._id.toString();
      deptObj.courseCount = courseMap[idStr] || 0;
      deptObj.facultyCount = facultyMap[idStr] || 0;
      deptObj.studentCount = studentMap[idStr] || 0;
      return deptObj;
    });

    res.status(200).json({
      success: true,
      data: departmentsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate({
        path: 'departmentHead',
        populate: { path: 'user', select: 'name email' },
      });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const courses = await Course.find({ department: department._id, status: 'ACTIVE' });
    const faculty = await Faculty.find({ department: department._id, status: 'ACTIVE' })
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: {
        department,
        courses,
        faculty,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, departmentHead } = req.body;

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new AppError('Department code already exists', 409);
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      departmentHead: departmentHead || null,
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, departmentHead, status } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    if (code && code.toUpperCase() !== department.code) {
      const existing = await Department.findOne({ code: code.toUpperCase() });
      if (existing) {
        throw new AppError('Department code already in use', 409);
      }
      department.code = code.toUpperCase();
    }

    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (departmentHead !== undefined) department.departmentHead = departmentHead || null;
    if (status) department.status = status;

    await department.save();

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    // Check if courses or students exist
    const hasCourses = await Course.exists({ department: department._id });
    const hasStudents = await Student.exists({ department: department._id });

    if (hasCourses || hasStudents) {
      // Soft-delete / deactivate instead
      department.status = 'INACTIVE';
      await department.save();
      return res.status(200).json({
        success: true,
        message: 'Department has associated records. Marked as INACTIVE instead of deleting.',
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
