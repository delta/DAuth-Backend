import express, { Router } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import { removeAccess, userInfo } from '../controllers/dashboardController';

const router: Router = express.Router();

//authorized apps of user
router.get('/apps', isAuthenticated, userInfo);

//revokes authorization access of a user to a client
router.post('/remove-access',isAuthenticated, removeAccess);

export default router;
