import { Request, Response } from 'express';
import prisma from '../config/prismaClient';

export const getUserResource = async (req: Request, res: Response) => {
  try {
    const { token } = res.locals.token;
    const email = await prisma.email.findUnique({
      where: {
        id: token.user.emailId
      },
      select: {
        email: true
      }
    });
    const user = { ...email, ...token.user };
    delete user['emailId'];
    delete user['password'];
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTagsResource = (req: Request, res: Response) => {
  res.status(200).json({ message: 'work in progress' });
};
