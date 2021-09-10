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

// helper to generate id token(jwt) for oidc(user authentication)
export const generateIdToken = (
  scope: string,
  user: any,
  authCode: any,
  clientId: string
): string | null => {
  if (!user) return null;

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
    expiresIn: '5 m', // 5 minutes
    header: {
      typ: 'JWT'
    }
  });
  return idToken;
};

export const generateClientId = (): string => {
  return cryptoRandomString({ length: 16, type: 'url-safe' });
};

export const generateClientSecret = (): string => {
  return cryptoRandomString({ length: 32, type: 'url-safe' });
};

export const generateForgotPasswordToken = (
  _email: string,
  _id: number,
  _hash: string
): string => {
  const payload = {
    email: _email,
    id: _id
  };
  const token = JWT.sign(payload, _hash, {
    issuer: process.env.FRONTEND_URL,
    expiresIn: '5 m', // 5 minutes
    header: {
      typ: 'JWT'
    }
  });
  return token;
};
