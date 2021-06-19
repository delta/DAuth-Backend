import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { saveStateAndNonce } from '../utils/oauth';

export const handleAuthorize = async (req: Request, res: Response) => {
  const { code } = res.locals.code;
  // redirect uri
  const location = res.locals.location;
  console.log(location);

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

export const validateClient = async (req: Request, res: Response) => {
  const { client_id, redirect_uri } = req.query;

  try {
    const client = await prisma.client.findUnique({
      where: {
        clientId: client_id as string
      },
      select: {
        name: true,
        clientId: true,
        redirectUri: true
      }
    });
    // if client not found
    if (!client) return res.status(404).json({ message: 'client not found' });
    // if redirecturi mismatch
    if (client.redirectUri !== redirect_uri)
      return res.status(400).json({ message: 'invalid redirect uri' });

    return res
      .status(200)
      .json({ message: 'client successfully identified', client });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleToken = (req: Request, res: Response) => {
  console.log(res.locals.token);
  res.send('token endpoint working');
};
