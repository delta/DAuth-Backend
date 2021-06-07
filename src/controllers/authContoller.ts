import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import prisma from '../config/prismaClient';

export const validateRegisterFields = [
  check('name').exists().trim().not().isEmpty().withMessage('Name is required'),
  check('email')
    .exists()
    .normalizeEmail()
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Invalid email address'),
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

export const register = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  console.log(name, email, password);
  try {
    const resourceOwner = await prisma.resourceOwner.findUnique({
      where: {
        email: email
      }
    });
    // check if email is already registered
    if (resourceOwner !== null) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await prisma.resourceOwner.create({
      data: {
        email: email,
        name: name,
        password: hashPassword,
        ActivationCode: {
          create: {
            activationCode: hashPassword,
            expireAt: new Date()
          }
        }
      }
    });
    // TODO
    // mail verfication link
    return res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = (req: Request, res: Response): Promise<Response> => {
  return (res as any).status(200).send('hello world');
};

export const logout = (req: Request, res: Response): Promise<Response> => {
  return (res as any).status(200).send('hello world');
};
