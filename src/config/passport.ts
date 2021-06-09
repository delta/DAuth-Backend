import passportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import prisma from './prismaClient';
import { ResourceOwner } from '.prisma/client';
import { Application } from 'express';

const LocalStrategy = passportLocal.Strategy;

const getUserByEmail = async (email: string) => {
  const user = await prisma.email.findUnique({
    where: {
      email: email
    },
    select: {
      ResourceOwner: true
    }
  });

  return user?.ResourceOwner;
};

const getUserById = async (id: number): Promise<ResourceOwner | null> => {
  return await prisma.resourceOwner.findUnique({
    where: {
      id: id
    }
  });
};

const authenticateUser = async (email: string, password: string, done: any) => {
  const user = await getUserByEmail(email);
  if (user == null) {
    return done(null, false, { message: 'Email not found' });
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Password incorrect' });
    }
  } catch (e) {
    return done(e);
  }
};

export const initialisePassport = (app: Application): void => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user: any, done: any) => done(null, user.id));
  passport.deserializeUser(async (id: any, done: any) => {
    return done(null, await getUserById(id));
  });
};
