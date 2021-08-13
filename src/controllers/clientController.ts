import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prismaClient';
import { check, validationResult } from 'express-validator';
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
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();

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

    // fetch client data
    const client = await prisma.client.findUnique({
      where: {
        clientId: clientId
      },
      select: {
        name: true,
        redirectUri: true,
        homePageUrl: true,
        userId: true,
        description: true,
        createdAt: true,
        id: true,
        clientId: true,
        authorizedApps: true
      }
    });
    return res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//to delete a client
export const deleteClient = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const { clientId } = req.body;
    const client = await prisma.client.findUnique({
      where: {
        clientId: clientId as string
      },
      select: {
        id: true
      }
    });

    if (client) {
      //delete token, authorised apps, codes before deleting client
      const deleteCodes = prisma.code.deleteMany({
        where: {
          clientId: client.id
        }
      });
      const deleteApps = prisma.authorisedApps.deleteMany({
        where: {
          clientId: client.id
        }
      });
      const deleteTokens = prisma.authorisedApps.deleteMany({
        where: {
          clientId: client.id
        }
      });
      const deleteClient = prisma.client.delete({
        where: {
          clientId: clientId
        }
      });

      //either all are deleted together or the action fails.
      await prisma.$transaction([deleteCodes, deleteTokens, deleteApps, deleteClient]);

      return res.status(200).json({ message: 'Client deleted successfully.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//to update client details
export const updateClient = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const { clientId, name, homePageUrl, callbackUrl, description } = req.body;

    //update client
    const result = await prisma.client.update({
      where: {
        clientId: clientId
      },
      data: {
        name: name,
        homePageUrl: homePageUrl,
        redirectUri: callbackUrl,
        description: description
      }
    });
    return res.status(200).json({ message: 'Client updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//to generate client secret
export const generateNewSecret = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const { clientId } = req.body;
    const newSecret = generateClientSecret();

    //update client secret
    const result = await prisma.client.update({
      where: {
        clientId: clientId as string
      },
      data: {
        clientSecret: newSecret
      }
    });
    if (!result) return res.status(400).json({ message: 'Client not found' });
    return res.status(200).json({
      message:
        'Make sure you copy the client secret. It will not be visible again.',
      secret: newSecret
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const isPermitted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<unknown> => {
  try {
    const { clientId } = req.body;
    if (!clientId)
      return res.status(400).json({ message: 'Client Id is required.' });
    const user: any = req.user;
    // fetch client data
    const client = await prisma.client.findUnique({
      where: {
        clientId: clientId
      },
      select: {
        userId: true
      }
    });

    if (!client) res.status(400).json({ message: 'Client not found.' });
    if (client && client.userId != user.id)
      return res.status(404).json({
        message: 'You do not have the required permissions.'
      });
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
