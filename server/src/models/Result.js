import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: [true, 'Examination is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    obtainedMarks: {
      type: Number,
      required: [true, 'Obtained marks is required'],
      min: [0, 'Obtained marks cannot be negative'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1'],
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [5, 'Grade cannot exceed 5 characters'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate results for the same student and examination
resultSchema.index({ student: 1, examination: 1 }, { unique: true });
resultSchema.index({ student: 1, subject: 1 });
resultSchema.index({ examination: 1, isPublished: 1 });

// Calculate grade based on percentage
resultSchema.pre('save', function (next) {
  const percentage = (this.obtainedMarks / this.maxMarks) * 100;
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C';
  else if (percentage >= 40) this.grade = 'D';
  else this.grade = 'F';

  // Validate obtained marks don't exceed max marks
  if (this.obtainedMarks > this.maxMarks) {
    return next(new Error('Obtained marks cannot exceed maximum marks'));
  }
  next();
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
