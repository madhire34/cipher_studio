import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { userValidation, validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', userValidation.register, validate, registerUser);
router.post('/login', userValidation.login, validate, loginUser);

router.get('/me', protect, getMe);

export default router;
