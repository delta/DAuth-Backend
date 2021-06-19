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

// client_id     |
// redirect_uri  |
// response_type |
// grant_type    | -> query params
// state         |
// scope         |
// nonce         |
router.get('/authorize', checkAuthenticated, validateClient);

// authorize route
// 'false' === req.query.allowed, for user who denied access to application
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

// TODO: move to seperate module
router.get('/resource', oauth.authenticate(), (req, res) => {
  res.send(res.locals.tokens);
});
export default router;
