import { NextFunction, Request, Response } from 'express';
import { getMailContent, sendMail } from '../utils/mail';

export const sendVerifyMail = async (req: Request, res: Response) => {
  const content = `Thanks for signing up on Dauth.nitt.edu. We're thrilled to have you!. To get started, please click the link below to verify your webmail address.`;
  const subject = `Webmail verification`;
  const email: string = res.locals.email;
  const name = email.slice(0, -9);
  const linkText = 'verify';
  const link = `${process.env.FRONTEND_URL}/verify/?token=${res.locals.activationCode}`;
  const mailContent = getMailContent(name, link, content, linkText);
  try {
    await sendMail(email, subject, mailContent);
    return res
      .status(200)
      .json({ message: 'Verification link sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
