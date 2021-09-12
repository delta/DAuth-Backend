import { Request, Response } from 'express';
import { getMailContent, sendMail } from '../utils/mail';

export const sendVerifyMail = async (req: Request, res: Response) => {
  const content = `Thanks for signing up on ${process.env.FRONTEND_URL}. We're thrilled to have you!. To get started, please click the link below to verify your webmail address.`;
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

export const sendForgotPasswordMail = async (req: Request, res: Response) => {
  const content =
    "We have received a password reset request for your account. Kindly click the link below to proceed. If this isn't you, try changing your password or send an alert mail to delta@nitt.edu.";
  const email: string = req.body.email;
  const name = email.slice(0, -9);
  const token = res.locals.token;
  const link = `${process.env.FRONTEND_URL}/resetPassword?token=${token}&webmailId=${email}`;
  const linkText = 'Password reset link';
  const mailContent = getMailContent(name, link, content, linkText);
  const subject = 'Password reset';
  try {
    await sendMail(email, subject, mailContent);
    return res
      .status(200)
      .json({ message: 'Password reset mail sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
