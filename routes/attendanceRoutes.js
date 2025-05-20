import express from 'express';
import {
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
} from '../controllers/attendanceController.js';

const router = express.Router();

// Specific routes first
router.get('/stats', getAttendanceStats);
router.get('/date/:date', getAttendanceByDate);
router.get('/class/:classId', getAttendanceByClass);
router.get('/date/:date/class/:classId', getAttendanceByDateAndClass);
router.get('/range/:startDate/:endDate', getAttendanceByDateRange);

// Generic routes last
router.route('/')
  .get(getAttendance)
  .post(createAttendance);

router.route('/:id')
  .get(getAttendanceById)
  .put(updateAttendance)
  .delete(deleteAttendance);

export default router;