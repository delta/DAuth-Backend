import express, { Router } from 'express';
import { register, validateRegisterFields } from '../controllers/authContoller';
const router: Router = express.Router();

// register route
router.post('/register', validateRegisterFields, register);
// // login route
// router.post('/login', authenticate);
// // logout route
// router.post('/logout', logout);

export default router;
