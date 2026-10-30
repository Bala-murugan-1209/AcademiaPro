import mongoose from 'mongoose';

const examinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Examination name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
    },
    examDate: {
      type: Date,
      required: [true, 'Examination date is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1'],
    },
    examType: {
      type: String,
      enum: ['MID_TERM', 'END_TERM', 'ASSIGNMENT', 'PRACTICAL', 'QUIZ', 'OTHER'],
      default: 'OTHER',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

examinationSchema.index({ subject: 1, semester: 1 });
examinationSchema.index({ course: 1, semester: 1 });
examinationSchema.index({ isPublished: 1 });

const Examination = mongoose.model('Examination', examinationSchema);
export default Examination;
