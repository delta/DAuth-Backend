import express, { Router, Request } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import {
  handleAuthorize,
  checkAuthenticated,
  validateClient,
  handleToken,
  getClaims,
  isClientAuthorized
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
router.get(
  '/authorize',
  checkAuthenticated,
  validateClient,
  isClientAuthorized
);

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

router.post('/token', getClaims, oauth.token(), handleToken);

// TODO: make a seperate router
router.post('/resource', oauth.authenticate(), (req, res) => {
  res.send('resource working');
});

export default router;