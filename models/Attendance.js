import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  classId: {
    type: String,
    required: true,
    ref: 'Class'
  },
  totalStudents: {
    type: Number,
    required: true
  },
  presentStudents: {
    type: Number,
    required: true
  },
  absentStudents: {
    type: Number,
    required: true
  },
  absentRollNumbers: {
    type: [Number],
    default: []
  },
  attendancePercentage: {
    type: Number,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique attendance record per class per day
attendanceSchema.index({ date: 1, classId: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;