import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { check, validationResult } from 'express-validator';
import { isAuthorizedApp, saveStateAndNonce } from '../utils/oauth';
import { generateClientId, generateClientSecret } from '../utils/utils';

export const validateClientRegisterFields = [
  check('name')
    .exists()
    .trim()
    .not()
    .isEmpty()
    .withMessage('Application Name is required'),
  check('homepageUrl')
    .exists()
    .trim()
    .isURL()
    .not()
    .isEmpty()
    .withMessage('Valid home page URL is required.'),
  check('callbackUrl')
    .exists()
    .trim()
    .isURL()
    .not()
    .isEmpty()
    .withMessage('Valid callback URL is required.'),
  check('description')
    .exists()
    .trim()
    .not()
    .isEmpty()
    .withMessage('Description is required')
];

//to register a client.
export const registerClient = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, homepageUrl, callbackUrl, description } = req.body;
  try {
    // generate client credentials
    const clientId = await generateClientId();
    const clientSecret = await generateClientSecret();

    const user: any = req.user;
    // create client
    await prisma.client.create({
      data: {
        name,
        description,
        homePageUrl: homepageUrl,
        redirectUri: callbackUrl,
        clientId,
        clientSecret,
        userId: user.id
      }
    });
    return res
      .status(200)
      .json({ message: 'Registration for the client is successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//to get a list of clients the user created.
export const getClientList = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const user: any = req.user;
    // fetch clients
    const clients = await prisma.client.findMany({
      where: {
        userId: user.id
      },
      select: {
        name: true,
        id: true,
        homePageUrl: true,
        description: true,
        clientId: true
      }
    });
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//to get all details of a client by the user
export const getClientDetailsByUser = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const { clientId } = req.body;
    if (!clientId)
      return res.status(422).json({ message: 'Client Id is required.' });
    const user: any = req.user;
    // fetch client data
    const client = await prisma.client.findUnique({
      where: {
        clientId: clientId
      }
    });
    if (!client) return res.status(400).json({ message: 'Client Not Found!' });
    if (user.id != client.userId)
      return res
        .status(404)
        .json({ message: 'You are not authorized for the client details!' });
    return res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
