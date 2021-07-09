import express, { Router } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import {
  getClientDetailsByUser,
  getClientList,
  registerClient,
  validateClientRegisterFields
} from '../controllers/clientController';

const router: Router = express.Router();
router.use(isAuthenticated);

// name         |
// description  |-->fields required during registration.
// callbackUrl  |
// homepageUrl  |
//to register client by the user.
router.post('/register', validateClientRegisterFields, registerClient);

//fetch client details if the user is admin
router.post('/details', getClientDetailsByUser);

//fetch client details if the user is admin
router.get('/list', getClientList);

export default router;
