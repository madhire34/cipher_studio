import express from 'express';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { projectValidation, validate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.post('/', projectValidation.create, validate, createProject);
router.get('/user', getUserProjects);
router.get('/:id', getProjectById);
router.put('/:id', projectValidation.update, validate, updateProject);
router.delete('/:id', deleteProject);

export default router;
