import prisma from '../config/prismaClient';
import { Request, Response } from 'express';

//returns userInfo for dashboard
export const userInfo = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const user: any = req.user;
  try {
    const userInfo = await prisma.resourceOwner.findUnique({
      where: {
        id: user.id
      },
      select: {
        name: true,
        phoneNumber: true,
        gender: true,
        email: {
          select: {
            email: true
          }
        },
        authorizedApps: {
          select: {
            client: {
              select: {
                id: true,
                name: true,
                homePageUrl: true,
                description: true
              }
            },
            createdAt: true
          }
        }
      }
    });
    return res.status(200).json(userInfo);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeAccess = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const user: any = req.user;
  if (req.body.clientId) {
    try {
      const app = await prisma.authorisedApps.delete({
        where: {
          clientId_userId: {
            clientId: req.body.clientId,
            userId: user.id
          }
        },
        select: {
          clientId: true,
          client: {
            select: {
              name: true
            }
          }
        }
      });
      return res
        .status(200)
        .json({ message: 'Removed authorization to ' + app?.client.name, app });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  return res.status(400).json({ message: 'Client id is missing' });
};
