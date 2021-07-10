import { NextFunction, Request, Response } from 'express';

export const getUserResource = (req: Request, res: Response) => {
  const user: any = req.user;
  return res.status(200).json(user);
};

export const getTagsResource = (req: Request, res: Response) => {
  res.status(200).json({ message: 'work in progress' });
};
