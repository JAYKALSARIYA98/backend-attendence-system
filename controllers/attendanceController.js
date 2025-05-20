import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Public
const createAttendance = asyncHandler(async (req, res) => {
  const { 
    date, 
    classId, 
    totalStudents, 
    presentStudents, 
    absentStudents, 
    absentRollNumbers, 
    attendancePercentage, 
    teacherName 
  } = req.body;
  
  // Check if attendance for this class and date already exists
  const existingAttendance = await Attendance.findOne({ 
    date: new Date(date), 
    classId 
  });
  
  if (existingAttendance) {
    res.status(400);
    throw new Error('Attendance record for this class and date already exists');
  }
  
  const attendance = await Attendance.create({
    date: new Date(date),
    classId,
    totalStudents,
    presentStudents,
    absentStudents,
    absentRollNumbers: absentRollNumbers || [],
    attendancePercentage,
    teacherName
  });
  
  res.status(201).json(attendance);
});

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Public
const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({}).sort('-date');
  res.json(attendance);
});

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Public
const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  
  if (attendance) {
    res.json(attendance);
  } else {
    res.status(404);
    throw new Error('Attendance record not found');
  }
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Public
const updateAttendance = asyncHandler(async (req, res) => {
  const { 
    date, 
    classId, 
    totalStudents, 
    presentStudents, 
    absentStudents, 
    absentRollNumbers, 
    attendancePercentage, 
    teacherName 
  } = req.body;
  
  const attendance = await Attendance.findById(req.params.id);
  
  if (attendance) {
    // Check if this update would create a duplicate entry
    if (date && classId && (date !== attendance.date.toISOString().split('T')[0] || classId !== attendance.classId)) {
      const existingAttendance = await Attendance.findOne({ 
        date: new Date(date), 
        classId,
        _id: { $ne: req.params.id }
      });
      
      if (existingAttendance) {
        res.status(400);
        throw new Error('Attendance record for this class and date already exists');
      }
    }
    
    attendance.date = date ? new Date(date) : attendance.date;
    attendance.classId = classId || attendance.classId;
    attendance.totalStudents = totalStudents !== undefined ? totalStudents : attendance.totalStudents;
    attendance.presentStudents = presentStudents !== undefined ? presentStudents : attendance.presentStudents;
    attendance.absentStudents = absentStudents !== undefined ? absentStudents : attendance.absentStudents;
    attendance.absentRollNumbers = absentRollNumbers || attendance.absentRollNumbers;
    attendance.attendancePercentage = attendancePercentage !== undefined ? attendancePercentage : attendance.attendancePercentage;
    attendance.teacherName = teacherName || attendance.teacherName;
    
    const updatedAttendance = await attendance.save();
    res.json(updatedAttendance);
  } else {
    res.status(404);
    throw new Error('Attendance record not found');
  }
});

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Public
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  
  if (attendance) {
    await attendance.deleteOne();
    res.json({ message: 'Attendance record removed' });
  } else {
    res.status(404);
    throw new Error('Attendance record not found');
  }
});

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Public
const getAttendanceByDate = asyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  
  const attendance = await Attendance.find({
    date: {
      $gte: date,
      $lt: nextDay
    }
  }).sort('classId');
  
  res.json(attendance);
});

// @desc    Get attendance by class
// @route   GET /api/attendance/class/:classId
// @access  Public
const getAttendanceByClass = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({
    classId: req.params.classId
  }).sort('-date');
  
  res.json(attendance);
});

// @desc    Get attendance by date and class
// @route   GET /api/attendance/date/:date/class/:classId
// @access  Public
const getAttendanceByDateAndClass = asyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  
  const attendance = await Attendance.findOne({
    date: {
      $gte: date,
      $lt: nextDay
    },
    classId: req.params.classId
  });
  
  if (attendance) {
    res.json(attendance);
  } else {
    res.status(404);
    throw new Error('Attendance record not found for this date and class');
  }
});

// @desc    Get attendance by date range
// @route   GET /api/attendance/range/:startDate/:endDate
// @access  Public
const getAttendanceByDateRange = asyncHandler(async (req, res) => {
  const startDate = new Date(req.params.startDate);
  const endDate = new Date(req.params.endDate);
  endDate.setDate(endDate.getDate() + 1); // Include the end date
  
  const attendance = await Attendance.find({
    date: {
      $gte: startDate,
      $lt: endDate
    }
  }).sort('-date classId');
  
  res.json(attendance);
});

// @desc    Get attendance statistics for dashboard
// @route   GET /api/attendance/stats
// @access  Public
const getAttendanceStats = asyncHandler(async (req, res) => {
  try {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // Get latest attendance record for each class to get accurate total students
    const latestAttendance = await Attendance.aggregate([
    {
        $sort: { date: -1 }
    },
    {
      $group: {
          _id: "$classId",
          latestRecord: { $first: "$$ROOT" }
      }
    }
  ]);
  
    // Calculate total students from latest records
    const totalStudents = latestAttendance.reduce((sum, record) => sum + record.latestRecord.totalStudents, 0);

    // Get today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });
  
    // Calculate average attendance percentage from all records
    const allAttendance = await Attendance.find({});
    const avgAttendance = allAttendance.length > 0
      ? allAttendance.reduce((sum, record) => sum + record.attendancePercentage, 0) / allAttendance.length
      : 0;
  
    // Get recent attendance records for the chart (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
    const recentAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo }
    })
    .sort('date')
    .select('date attendancePercentage');
  
  res.json({
    totalStudents,
      averageAttendance: parseFloat(avgAttendance.toFixed(2)),
      todayPresent: todayAttendance.reduce((sum, record) => sum + record.presentStudents, 0),
      totalClasses: latestAttendance.length,
      recentAttendance: recentAttendance.map(record => ({
        date: record.date,
        percentage: record.attendancePercentage
      }))
    });
  } catch (error) {
    console.error('Error in getAttendanceStats:', error);
    res.status(500).json({
      message: 'Error calculating attendance statistics',
      error: error.message
    });
  }
});

export {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByClass,
  getAttendanceByDateAndClass,
  getAttendanceByDateRange,
  getAttendanceStats
};