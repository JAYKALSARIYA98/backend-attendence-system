import asyncHandler from 'express-async-handler';
import Class from '../models/Class.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({}).sort('name');
  res.json(classes);
});

// @desc    Get a class by ID
// @route   GET /api/classes/:id
// @access  Public
const getClassById = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  
  if (classItem) {
    res.json(classItem);
  } else {
    res.status(404);
    throw new Error('Class not found');
  }
});

// @desc    Create a new class
// @route   POST /api/classes
// @access  Public
const createClass = asyncHandler(async (req, res) => {
  const { name, division, department, totalStudents, teacherName } = req.body;
  
  const classExists = await Class.findOne({ name });
  
  if (classExists) {
    res.status(400);
    throw new Error('Class already exists');
  }
  
  const newClass = await Class.create({
    name,
    division,
    department,
    totalStudents: totalStudents || 0,
    teacherName: teacherName || ''
  });
  
  res.status(201).json(newClass);
});

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Public
const updateClass = asyncHandler(async (req, res) => {
  const { name, division, department, totalStudents, teacherName } = req.body;
  
  const classItem = await Class.findById(req.params.id);
  
  if (classItem) {
    classItem.name = name || classItem.name;
    classItem.division = division || classItem.division;
    classItem.department = department || classItem.department;
    classItem.totalStudents = totalStudents !== undefined ? totalStudents : classItem.totalStudents;
    classItem.teacherName = teacherName || classItem.teacherName;
    
    const updatedClass = await classItem.save();
    res.json(updatedClass);
  } else {
    res.status(404);
    throw new Error('Class not found');
  }
});

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Public
const deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  
  if (classItem) {
    await classItem.deleteOne();
    res.json({ message: 'Class removed' });
  } else {
    res.status(404);
    throw new Error('Class not found');
  }
});

// @desc    Get classes by division
// @route   GET /api/classes/division/:division
// @access  Public
const getClassesByDivision = asyncHandler(async (req, res) => {
  const classes = await Class.find({ division: req.params.division }).sort('name');
  res.json(classes);
});

export { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass,
  getClassesByDivision
};