import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prismaClient';

export const handleAuthorize = (req: Request, res: Response): Response => {
  console.log(res.locals.code);
  return res.send('authrization working');
};

export const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // if user not authenticated, redirect him to login page
  // saving query in session, to redirect again him to authorize page
  if (!req.isAuthenticated()) {
    (req.session as any).query = req.query;
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  }

  next();
};

export const validateClient = async (req: Request, res: Response) => {
  const { client_id, redirect_uri } = req.query;

  try {
    const client = await prisma.client.findUnique({
      where: {
        clientId: client_id as string
      }
    });
    // if client not found
    if (!client) return res.status(404).json({ message: 'client not found' });
    // if redirecturi mismatch
    if (client.redirectUri !== redirect_uri)
      return res.status(400).json({ message: 'invalid redirect uri' });

    return res.status(200).json({ message: 'client successfully identified' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleToken = (req: Request, res: Response) => {
  console.log(res.locals.token);
  res.send('token endpoint working');
};
