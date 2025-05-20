import express from 'express';
import {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport
} from '../controllers/reportController.js';

const router = express.Router();

router.route('/')
  .get(getAllReports);

router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

router.post('/generate', generateReport);

export default router;