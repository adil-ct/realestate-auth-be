import express from 'express';
import authRouter from '../components/auth/route.js';
const router = express.Router();

router.use('/auth', authRouter);

export default router;
