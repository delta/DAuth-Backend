import express, { Router } from 'express';
const router: Router = express.Router();
import {
  isActivated,
  isAuth,
  isLoggedIn,
  login,
  logout,
  register,
  validateLoginFields,
  validateRegisterFields
} from '../controllers/authContoller';

// route to check if user is already logged in
router.get('/is-auth', isLoggedIn, isActivated, isAuth);
// register route
router.post('/register', validateRegisterFields, register);
// login route
router.post('/login', validateLoginFields, login);
// logout route
router.post('/logout', isLoggedIn, logout);

export default router;
