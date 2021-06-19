import express, { Router, Request } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import {
  handleAuthorize,
  checkAuthenticated,
  validateClient,
  handleToken
} from '../controllers/oauthContoller';
import oauth from '../oauth/index';

const router: Router = express.Router();

router.get('/authorize', checkAuthenticated, validateClient);

router.post(
  '/authorize',
  isAuthenticated,
  oauth.authorize({
    authenticateHandler: {
      handle: (req: Request) => {
        return req.user;
      }
    }
  }),
  handleAuthorize
);

router.post('/token', oauth.token(), handleToken);

// TODO: make it as seperate module
router.get('/resource', oauth.authenticate(), (req, res) => {
  res.send(res.locals.tokens);
});
export default router;
