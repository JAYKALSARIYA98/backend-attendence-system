import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  division: {
    type: String,
    required: true,
    enum: ['Pre-School', 'Primary (1-5)', 'Middle (6-10)', 'Middle (6-10 General)', 'Secondary (11-12)']
  },
  department: {
    type: String,
    enum: ['General', 'Star', 'Science', 'Commerce', 'Arts', null],
    default: null
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  teacherName: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Class = mongoose.model('Class', classSchema);

export default Class;
