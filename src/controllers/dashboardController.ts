import prisma from '../config/prismaClient';
import { Request, Response } from 'express';

//returns userInfo for dashboard
export const userInfo = async (req: Request, res: Response): Promise<unknown> => {
  const user: any = req.user
  if (user && user.id) {
    try{
      const userInfo: any = await prisma.resourceOwner.findUnique({
        where: {
          id: user.id
        },
        select: {
          name: true,
          phoneNumber: true,
          department: true,
          year: true,
          email:{
            select:{
              email: true
            }
          },
          authorizedApps:{
            select:{
              client:{
                select:{
                  id: true,
                  name: true,
                  redirectUri: true
                }
              },
              createdAt: true
            }
          }
        }
      });
      return res.status(200).json( userInfo );
    }catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
    
  }
  return res.status(401).json({ message: 'Invalid request' });
};


export const removeAccess = async (req: Request, res: Response): Promise<unknown> => {
  const user : any = req.user;
  if(user && user.id && req.body.clientId){
    try {
      await prisma.authorisedApps.delete({
        where: {
          clientId_userId: {
            clientId: req.body.clientId,
            userId: user.id
          }
        }
      });
      return res.status(204).json({ message: 'Removed authorized app' });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to process your request' });
    }
  }
  return res.status(401).json({ message: 'Invalid request' });
}
