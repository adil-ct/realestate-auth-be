import express from 'express';
import { sendOTP, verifyOTP, emailSending, sendJWTToken, verifyToken, addToAuthenticator, validateAuthenticator, getCountry, getCities, getDistrict } from './controller.js';
const router = express.Router();

router.post('/token', sendJWTToken);
router.get('/verify', verifyToken);
router.post('/sendOTP', sendOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/email', emailSending);
router.post('/authenticator', addToAuthenticator);
router.post('/validator', validateAuthenticator);
router.get('/country-code', getCountry);
router.get('/cities/:country', getCities);
router.get('/district/:country', getDistrict);
export default router;
