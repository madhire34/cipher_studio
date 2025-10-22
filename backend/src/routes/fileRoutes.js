import express from 'express';
import {
  createFile,
  getFileById,
  getProjectFiles,
  updateFile,
  deleteFile,
} from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';
import { fileValidation, validate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.post('/', fileValidation.create, validate, createFile);
router.get('/project/:projectId', getProjectFiles);
router.get('/:id', getFileById);
router.put('/:id', fileValidation.update, validate, updateFile);
router.delete('/:id', deleteFile);

export default router;
