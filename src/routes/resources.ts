import express, { Router, Request, Response } from 'express';
import {
  getTagsResource,
  getUserResource
} from '../controllers/resourceController';
import oauth from '../oauth';

const router: Router = express.Router();

// user resource route
router.post('/user', oauth.authenticate({ scope: 'user' }), getUserResource);

// TODO: tags
// tag resource route
router.post('/tags', oauth.authenticate({ scope: 'tags' }), getTagsResource);

export default router;
