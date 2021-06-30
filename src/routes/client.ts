import express, { Router, Request } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import {
  getClientDetailsByUser,
  getClientList,
  registerClient,
  validateClientRegisterFields
} from '../controllers/clientController';

const router: Router = express.Router();

// name         |
// description  |-->fields required during registration.
// callbackUrl  |
// homepageUrl  |
//to register client by the user.
router.post(
  '/register',
  isAuthenticated,
  validateClientRegisterFields,
  registerClient
);

//fetch client details if the user is admin
router.post('/details', isAuthenticated, getClientDetailsByUser);

//fetch client details if the user is admin
router.get('/list', isAuthenticated, getClientList);

export default router;
