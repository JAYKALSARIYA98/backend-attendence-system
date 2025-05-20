import asyncHandler from 'express-async-handler';
import Report from '../models/Report.js';
import Attendance from '../models/Attendance.js';

// @desc    Generate a new report
// @route   POST /api/reports/generate
// @access  Public
const generateReport = asyncHandler(async (req, res) => {
  const { 
    name, 
    startDate, 
    endDate, 
    division, 
    classId, 
    format, 
    generatedBy 
  } = req.body;
  
  // Convert dates to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1); // Include the end date
  
  // Build query based on filters
  const query = {
    date: {
      $gte: start,
      $lt: end
    }
  };
  
  // Add classId filter if provided
  if (classId) {
    query.classId = classId;
  }
  
  // Fetch attendance records
  const attendanceRecords = await Attendance.find(query).sort('date classId');
  
  // Create report
  const report = await Report.create({
    name: name || `Report ${new Date().toISOString()}`,
    startDate: start,
    endDate: end,
    division: division || null,
    classId: classId || null,
    format: format || 'summary',
    generatedBy: generatedBy || 'System',
    data: {
      records: attendanceRecords,
      totalRecords: attendanceRecords.length,
      dateGenerated: new Date()
    }
  });
  
  res.status(201).json(report);
});

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public
const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({}).sort('-createdAt');
  res.json(reports);
});

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Public
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (report) {
    res.json(report);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Public
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (report) {
    await report.deleteOne();
    res.json({ message: 'Report removed' });
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

export {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport
};