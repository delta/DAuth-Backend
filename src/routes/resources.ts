import express, { Router, Request, Response } from 'express';
import { getUserResource } from '../controllers/resourceController';
import oauth from '../oauth';

const router: Router = express.Router();

// user resource route
router.post('/user', oauth.authenticate({ scope: 'user' }), getUserResource);

// TODO: tags
// tag resource route
router.post(
  '/tags',
  oauth.authenticate({ scope: 'tags' }),
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'work in progress' });
  }
);

export default router;
