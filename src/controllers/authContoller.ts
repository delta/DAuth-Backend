import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import prisma from '../config/prismaClient';
import {
  expireDate,
  generateActivationCode,
  removeWhiteSpaces,
  validatePhoneNumber
} from '../utils/utils';
import passport from 'passport';
import { ResourceOwner } from '.prisma/client';

export const validateRegisterFields = [
  check('name').exists().trim().not().isEmpty().withMessage('Name is required'),
  check('phoneNumber')
    .exists()
    .trim()
    .customSanitizer(removeWhiteSpaces)
    .custom(validatePhoneNumber)
    .withMessage('Invalid phone number'),
  check('password')
    .exists()
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password should be atleast 6 characters'),
  check('repeatPassword', 'Passwords do not match')
    .exists()
    .trim()
    .custom((value, { req }) => value === req.body.password)
];

export const validateLoginFields = [
  check('email')
    .exists()
    .normalizeEmail()
    .contains('@nitt.edu')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Invalid email address'),
  check('password').exists().trim().withMessage('Password is required')
];

export const validateStartFields = [
  check('email')
    .exists()
    .normalizeEmail()
    .contains('@nitt.edu')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Invalid email address')
];

export const start = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const email: string = req.body.email;
  const verifiedEmail = (req as any).session.verifiedEmail;

  if (verifiedEmail)
    return res.status(200).json({
      message: 'Session Already started, Continue with your Registration'
    });

  try {
    const user = await prisma.email.findUnique({
      where: {
        email: email
      },
      select: {
        id: true,
        isActivated: true,
        expireAt: true,
        ResourceOwner: {
          select: {
            id: true
          }
        }
      }
    });
    // check if user is already registered with that email
    if (user?.ResourceOwner?.id && user.ResourceOwner.id)
      return res.status(409).json({ message: 'User already exists' });

    // check expiration time
    if (user?.expireAt && user.expireAt > new Date())
      return res
        .status(409)
        .json({ message: 'Verification Link already sent' });

    // 128 characters (url-safe)
    const activationCode = generateActivationCode();
    const expireAt = expireDate(
      process.env.MAIL_VERIFICATION_EXPIRY_TIME || '10'
    );

    // update activation code or create if not present
    // TODO: check for activation code expiry
    await prisma.email.upsert({
      where: {
        email: email
      },
      update: {
        activationCode: activationCode,
        expireAt: expireAt,
        isActivated: false
      },
      create: {
        email: email,
        activationCode: activationCode,
        expireAt: expireAt
      }
    });

    res.locals.email = email;
    res.locals.activationCode = activationCode;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const activationCode = req.params.id;
  if (!activationCode)
    return res.status(400).json({ message: 'Invalid Verification Link' });

  try {
    const email = await prisma.email.findUnique({
      where: {
        activationCode: activationCode
      }
    });

    if (!email) return res.status(404).json({ message: 'Email not found' });

    if (
      email.isActivated &&
      (req as any).session.verifiedEmail?.email === email.email
    ) {
      return res.status(200).json({ message: 'Email already verified' });
    }

    if (email.activationCode !== activationCode)
      return res.status(400).json({ message: 'Invalid Verification Link' });

    if (new Date() > email.expireAt)
      return res.status(498).json({ message: 'Verification Link Expired' });

    await prisma.email.update({
      where: {
        email: email.email
      },
      data: {
        isActivated: true
      }
    });

    //create registration session
    req.session.cookie.maxAge = 10 * 60 * 1000; // 10 minutes

    const verifiedEmail = { email: email.email, emailId: email.id };
    (req as any).session.verifiedEmail = verifiedEmail;
    // saving session, being extra safe :)
    req.session.save(() => {
      return res.status(200).json({ message: 'Email verified Successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const verifiedEmail = (req as any).session.verifiedEmail;
  if (!verifiedEmail)
    return res
      .status(408)
      .json({ message: 'Registration session expired, try again' });

  const { emailId } = verifiedEmail;
  // deleting registration session
  req.session.destroy((err) => {
    if (err) {
      throw new Error(err);
    }
  });

  const { name, password, phoneNumber } = req.body;
  try {
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create user
    await prisma.resourceOwner.create({
      data: {
        emailId: emailId,
        name: name,
        password: hashPassword,
        phoneNumber: phoneNumber
      }
    });
    return res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = (req: Request, res: Response): Response => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return passport.authenticate('local', (err, user: ResourceOwner) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });

    if (!user) return res.status(401).json({ message: 'Invalid Credentials' });

    req.logIn(user, function (err) {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }

      return res.status(200).json({ message: 'Login successful' });
    });
  })(req, res);
};

export const isAuth = (req: Request, res: Response): Response => {
  const user = req.user;
  if (user) return res.status(200).json({ message: 'User LoggedIn', user });

  return res.status(401).json({ message: 'User not LoggedIn' });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });

    return res.status(200).json({ message: 'Successfully Logged Out' });
  });
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | undefined => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: 'User not authenticated' });

  next();
};

export const isNotAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | undefined => {
  if (req.isAuthenticated())
    return res.status(400).json({ message: 'User already authenticated' });
  next();
};
