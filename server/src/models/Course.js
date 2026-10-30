import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [200, 'Course name cannot exceed 200 characters'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Course code cannot exceed 20 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    program: {
      type: String,
      trim: true,
      maxlength: [100, 'Program name cannot exceed 100 characters'],
    },
    duration: {
      type: Number, // in years
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 year'],
    },
    totalSemesters: {
      type: Number,
      required: [true, 'Total semesters is required'],
      min: [1, 'Must have at least 1 semester'],
    },
    credits: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

courseSchema.index({ department: 1, status: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;
