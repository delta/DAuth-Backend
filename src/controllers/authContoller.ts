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
  check('email')
    .exists()
    .normalizeEmail()
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Invalid email address'),
  check('phoneNumber')
    .exists()
    .trim()
    .customSanitizer(removeWhiteSpaces)
    .custom(validatePhoneNumber)
    .withMessage('Invalid phone number'),
  check('year')
    .exists()
    .trim()
    .toInt()
    .not()
    .isEmpty()
    .withMessage('Year is required'),
  check('department')
    .exists()
    .trim()
    .not()
    .isEmpty()
    .withMessage('Department is required'),
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
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Invalid email address'),
  check('password').exists().trim().withMessage('Password is required')
];

export const register = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phoneNumber, year, department } = req.body;
  try {
    const resourceOwner = await prisma.resourceOwner.findFirst({
      where: {
        OR: [
          {
            email: email
          },
          {
            phoneNumber: phoneNumber
          }
        ]
      }
    });
    // check if user is already registered
    if (resourceOwner !== null) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const expireAt = expireDate(
      process.env.MAIL_VERIFICATION_EXPIRY_TIME as string
    ).toISOString();
    // 128 characters (url-safe)
    const activationCode = generateActivationCode();

    // create user with activation code
    await prisma.resourceOwner.create({
      data: {
        email: email,
        name: name,
        password: hashPassword,
        phoneNumber: phoneNumber,
        year: year,
        department: department,
        ActivationCode: {
          create: {
            activationCode: activationCode,
            expireAt: expireAt
          }
        }
      }
    });
    // TODO
    // mail verfication link
    console.log(`[ActivationCode]: `, activationCode);

    return res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = (req: Request, res: Response): Response => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return passport.authenticate('local', (err, user: ResourceOwner) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    req.logIn(user, function (err) {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user.isActivated) {
        return res
          .status(401)
          .json({ message: 'Pending account, Please verfiy your email' });
      }
      return res.status(200).json({ message: 'Login successful', user: user });
    });
  })(req, res);
};

export const isAuth = (req: Request, res: Response): Response => {
  const user = req.user;
  if (user) {
    return res.status(200).json({ message: 'User LoggedIn', user });
  }
  return res.status(401).json({ message: 'User not LoggedIn' });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Successfully Logged Out' });
  });
};

export const isActivated = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | undefined => {
  const user = req.user;
  if (!(user as any).isActivated)
    return res
      .status(401)
      .json({ message: 'Pending account, Please verfiy your email' });

  next();
};

export const isLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | undefined => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: 'User not authenticated' });

  next();
};
