import { body, param, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
};

export const projectValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ max: 100 })
      .withMessage('Project name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('template')
      .optional()
      .isIn(['react', 'react-ts', 'vanilla', 'vue', 'angular', 'svelte'])
      .withMessage('Invalid template'),
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Project name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
};

export const fileValidation = {
  create: [
    body('projectId')
      .isMongoId()
      .withMessage('Invalid project ID'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('File/Folder name is required'),
    body('type')
      .isIn(['file', 'folder'])
      .withMessage('Type must be either file or folder'),
    body('parentId')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent ID'),
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('content')
      .optional()
      .isString()
      .withMessage('Content must be a string'),
  ],
};
