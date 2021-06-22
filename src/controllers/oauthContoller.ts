import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { isAuthorizedApp, saveStateAndNonce } from '../utils/oauth';
import { generateIdToken } from '../utils/utils';

// authorization handler, redirects to client redirecturi with code and state query params
export const handleAuthorize = async (req: Request, res: Response) => {
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
    }
    // saving nonce and state with code
    // state will be send back with code and accesstoken response
    // nonce will be part of id token (jwt) claims
    const isUpdated = await saveStateAndNonce(
      code.authorizationCode,
      req.body.state,
      req.body.nonce
    );

    if (!isUpdated)
      return res.status(500).json({ message: 'Internal server error' });

    return res.status(302).redirect(location);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | undefined => {
  // if user not authenticated, redirect him to login page
  // saving query in session, to redirect again him to authorize page
  if (!req.isAuthenticated()) {
    (req.session as any).query = req.query;
    return res.status(200).json({ message: 'user can login now!' });
    // res.redirect(`${process.env.FRONTEND_URL}/login`);
  }

  next();
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
  // getting cliams from before revoke authorization code for id token
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
    console.log(error);
    next();
  }
};

// handler for token endpoint
// oauth2-server doesn't support oidc
// have to generate id_token manually with required cliams for the given scopes
export const handleToken = (req: Request, res: Response) => {
  const { token } = res.locals.token;
  const code = res.locals.code;
  console.log(code);
  const user = req.user;
  const response: any = {
    token_type: 'Bearer',
    access_token: token.accessToken,
    state: code?.state,
    expires_in: token.accessTokenExpiresAt.getTime()
  };
  const idToken = generateIdToken(token.scope, user, code, token.client.id);
  if (idToken) {
    response.id_token = idToken;
  }
  res.status(200).json(response);
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
