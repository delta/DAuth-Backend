import cryptoRandomString from 'crypto-random-string';
import { isValidPhoneNumber } from 'libphonenumber-js';

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
