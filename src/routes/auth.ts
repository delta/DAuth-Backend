import express, { Router } from 'express';
const router: Router = express.Router();
import {
  isAuth,
  isAuthenticated,
  isNotAuthenticated,
  login,
  logout,
  register,
  start,
  validateLoginFields,
  validateRegisterFields,
  validateStartFields,
  verifyEmail
} from '../controllers/authContoller';
import { sendVerifyMail } from '../controllers/mailController';

/**
registration flow :
  -> hit the /start route with email for mail verification
  -> verify email @ /email/verify/:id to start the registration session
  -> hit /register for registration
  -> repeat if something goes wrong + session expired + activationCode expired  
 */

// route to check if user is already logged in
router.get('/is-auth', isAuthenticated, isAuth);
// logout route
router.post('/logout', isAuthenticated, logout);

router.use(isNotAuthenticated);
// register session start route
router.post('/start', validateStartFields, start, sendVerifyMail);
// verify email route
router.get('/email/verify/:id', verifyEmail);
// register route
router.post('/register', validateRegisterFields, register);
// login route
router.post('/login', validateLoginFields, login);

export default router;
