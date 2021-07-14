import express, { Router } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import {
  getClientDetailsByUser,
  getClientList,
  registerClient,
  updateClient,
  deleteClient,
  validateClientRegisterFields,
  generateNewSecret,
  isPermitted
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
router.post('/details', isPermitted, getClientDetailsByUser);

//fetch client details if the user is admin
router.get('/list', getClientList);

//update client details
router.put('/update', isPermitted, updateClient);

//delete client
router.delete('/delete', isPermitted, deleteClient);

//generate client secret
router.post('/generate-secret', isPermitted, generateNewSecret);

export default router;
