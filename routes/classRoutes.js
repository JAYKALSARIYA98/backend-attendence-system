import express from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByDivision
} from '../controllers/classController.js';

const router = express.Router();

router.route('/')
  .get(getClasses)
  .post(createClass);

router.route('/:id')
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

router.get('/division/:division', getClassesByDivision);

export default router;