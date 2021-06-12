import express, { Router } from 'express';
import { session } from 'passport';
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
  verfiyEmail
} from '../controllers/authContoller';

/**
registration flow :
  -> hit the /start route with email for mail verification
  -> verify email @ /email/verify/:id to start the registration session
  -> hit /register for registration
  -> repeat if something goes wrong + session expired + activationCode expired  
 */

// route to check if user is already logged in
router.get('/is-auth', isAuthenticated, isAuth);
// register session start route
router.post('/start', isNotAuthenticated, validateStartFields, start);
// verify email route
router.get('/email/verify/:id', isAuthenticated, verfiyEmail);
// register route
router.post('/register', isNotAuthenticated, validateRegisterFields, register);
// login route
router.post('/login', isNotAuthenticated, validateLoginFields, login);
// logout route
router.post('/logout', isAuthenticated, logout);

export default router;
