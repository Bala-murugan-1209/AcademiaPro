import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    currentSemester: {
      type: Number,
      required: [true, 'Current semester is required'],
      min: [1, 'Semester must be at least 1'],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    guardianName: {
      type: String,
      trim: true,
      maxlength: [100, 'Guardian name cannot exceed 100 characters'],
    },
    guardianPhone: {
      type: String,
      trim: true,
      maxlength: [20, 'Guardian phone cannot exceed 20 characters'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

studentSchema.index({ department: 1, course: 1, status: 1 });
studentSchema.index({ currentSemester: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
