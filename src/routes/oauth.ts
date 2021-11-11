import express, { Router, Request } from 'express';
import { isAuthenticated } from '../controllers/authContoller';
import {
  handleAuthorize,
  validateClient,
  handleToken,
  getClaims,
  isClientAuthorized,
  getIdToken,
  validateAuthorizeRequest
} from '../controllers/oauthContoller';
import oauth from '../oauth/index';

const router: Router = express.Router();

// client_id               |
// redirect_uri            |
// response_type           |
// grant_type              | -> query params
// state                   |
// scope                   |
// nonce                   |

// code_challenge          | ->pkce
// code_challenge_method   |
router.get('/authorize', isAuthenticated, validateClient, isClientAuthorized);

// authorize route
// 'false' === req.query.allowed, for user who denied access to application
router.post(
  '/authorize',
  validateAuthorizeRequest,
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

// token route, should/will be a backchannel communication
// code_verifier needed when code_challenge is present
router.post('/token', getClaims, oauth.token(), getIdToken, handleToken);

export default router;
