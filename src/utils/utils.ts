import cryptoRandomString from 'crypto-random-string';
import { JWK, JWT } from 'jose';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { privateJwk } from '../config/jwt';

export const generateActivationCode = (): string => {
  return cryptoRandomString({ length: 128, type: 'url-safe' });
};

export const expireDate = (minutes: string): Date => {
  const now = new Date();
  const extraMinutes = parseInt(minutes) || 10;
  return new Date(now.getTime() + extraMinutes * 60000);
};

export const validatePhoneNumber = (value: string): boolean => {
  return isValidPhoneNumber(value);
};

export const removeWhiteSpaces = (value: string): string => {
  return value.replace(/\s+/g, '');
};

export const generateIdToken = (
  scope: string,
  user: any,
  authCode: any,
  clientId: string
): string | null => {
  const scopes = scope.split(' ');
  if (!scopes.includes('openid')) return null;

  const payload: any = {
    sub: user.id,
    nonce: authCode?.nonce,
    auth_time: authCode?.createdAt
  };

  if (scopes.includes('email')) {
    payload.email = user.email.email;
    payload.email_verified = true;
  }

  if (scopes.includes('profile')) {
    payload.name = user.name;
  }

  const idToken = JWT.sign(payload, JWK.asKey(privateJwk), {
    audience: clientId,
    issuer: process.env.FRONTEND_URL,
    expiresIn: '5 m',
    header: {
      typ: 'JWT'
    }
  });
  return idToken;
};
