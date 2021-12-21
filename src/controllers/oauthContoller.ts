import { NextFunction, Request, Response } from 'express';
import { check, oneOf, validationResult } from 'express-validator';
import { URL } from 'url';
import prisma from '../config/prismaClient';
import { sendNewAppMail } from '../utils/mail';
import {
  isAuthorizedApp,
  saveStateAndNonce,
  saveStateCodeChallengeAndNonce,
  verifyCodeChallenge
} from '../utils/oauth';
import { generateIdToken } from '../utils/utils';

const isProd = process.env.NODE_ENV === 'production';

export const validateAuthorizeRequestParams = [
  check('state').not().isEmpty().withMessage('State is required'),
  check('nonce').not().isEmpty().withMessage('Nonce is required'),
  check('code_challenge').custom((value, { req }) => {
    if (value) {
      if (!req.body.code_challenge_method) {
        throw new Error('Code challenge method is required');
      } else if (!['S256', 'plain'].includes(req.body.code_challenge_method)) {
        throw new Error('Code challenge method must be either S256 or plain');
      } else return true;
    } else return true;
  })
];

export const validateAuthorizeRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isProd) {
    const url: string = req.headers['referer'] as string;
    const { hostname } = new URL(url);
    if (hostname != process.env.DOMAIN) {
      return res.status(400).json({ message: 'Bad request' });
    }
  }
  next();
};

// authorization handler, redirects to client redirecturi with code and state query params
export const handleAuthorize = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { code } = res.locals.code;
  const user: any = req.user;
  // redirect uri
  const location = res.locals.location;
  try {
    //check if client is authorized by the user
    const isAuthorized = await isAuthorizedApp(code.client.primaryKey, user.id);

    if (!isAuthorized) {
      await prisma.authorisedApps.create({
        data: {
          clientId: code.client.primaryKey,
          userId: user.id
        }
      });

      const app = await prisma.client.findUnique({
        where: {
          id: code.client.primaryKey
        },
        select: {
          name: true
        }
      });

      sendNewAppMail(user.email.email, user.name, app?.name || ' ');
    }
    // saving nonce and state with code
    // state will be send back with code and accesstoken response
    // nonce will be part of id token (jwt) claims
    let isUpdated;
    if (req.body.code_challenge) {
      isUpdated = await saveStateCodeChallengeAndNonce(
        code.authorizationCode,
        req.body
      ); // saving state, code_challenge and nonce
    } else {
      isUpdated = await saveStateAndNonce(
        code.authorizationCode,
        req.body.state,
        req.body.nonce
      ); // saving nonce and state with code
    }

    if (!isUpdated)
      return res.status(500).json({ message: 'Internal server error' });
    // redirecting to client app with auth code and state as query params
    //console.log(location)
    return res.status(302).redirect(location);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { client_id, redirect_uri } = req.query;

  try {
    const client = await prisma.client.findUnique({
      where: {
        clientId: client_id as string
      },
      select: {
        name: true,
        clientId: true,
        redirectUri: true,
        id: true
      }
    });
    // if client not found
    if (!client) return res.status(404).json({ message: 'client not found' });
    // if redirecturi mismatch
    if (client.redirectUri !== redirect_uri)
      return res.status(400).json({ message: 'invalid redirect uri' });

    res.locals.client = client;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getClaims = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // getting cliams from code before revoke authorization code, for id_token
  const { code } = req.body;
  if (!code) {
    next();
    return;
  }
  try {
    const authCode = await prisma.code.findUnique({
      where: {
        code: code
      },
      select: {
        nonce: true,
        state: true,
        createdAt: true
      }
    });

    res.locals.code = authCode;
    next();
  } catch (error) {
    next();
  }
};

export const verifyPKCE = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // getting cliams from code before revoke authorization code, for id_token
  const { code } = req.body;
  if (!code) {
    next();
    return;
  }
  try {
    const codeData = await prisma.code.findUnique({
      where: {
        code: code
      },
      select: {
        codeChallenge: true
      }
    });
    if (codeData?.codeChallenge) {
      if (!req.body.code_verifier) {
        return res.status(400).json({ message: 'Invalid code verifier.' });
      }
      const isVerified = await verifyCodeChallenge(
        code,
        req.body.code_verifier
      );
      if (!isVerified) {
        return res
          .status(404)
          .json({ message: 'Code challenge verification failed.' });
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// handler for token endpoint
// oauth2-server doesn't support oidc
// have to generate id_token with required cliams for the given scopes
export const handleToken = (req: Request, res: Response) => {
  const { token } = res.locals.token;
  const code = res.locals.code;

  const response: any = {
    token_type: 'Bearer',
    access_token: token.accessToken,
    state: code?.state,
    expires_in: token.accessTokenExpiresAt.getTime()
  };

  if (res.locals.id_token) {
    response.id_token = res.locals.id_token;
  }

  res.status(200).json(response);
};

export const getIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = res.locals.token;
  const code = res.locals.code;

  res.locals.id_token = null;
  try {
    const userId = await prisma.token.findUnique({
      where: {
        accessToken: token.accessToken
      },
      select: {
        userId: true
      }
    });
    if (!userId) return next();

    const user = await prisma.resourceOwner.findUnique({
      where: {
        id: userId.userId
      },
      include: {
        email: true
      }
    });
    res.locals.id_token = generateIdToken(
      token.scope,
      user,
      code,
      token.client.id
    );
    next();
  } catch (error) {
    next();
  }
};

// middleware to check if user already authorized the client
// show authorization page, if isAuthorized === false : else proceed directly
export const isClientAuthorized = async (req: Request, res: Response) => {
  const client = res.locals.client;
  const user: any = req.user;
  try {
    const isAuthorized = await isAuthorizedApp(client.id, user.id);
    return res
      .status(200)
      .json({ message: 'client identified', isAuthorized, client });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
