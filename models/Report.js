import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  division: {
    type: String,
    default: null
  },
  classId: {
    type: String,
    default: null
  },
  format: {
    type: String,
    enum: ['summary', 'detailed', 'template'],
    default: 'summary'
  },
  generatedBy: {
    type: String,
    default: 'System'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

export default Report;