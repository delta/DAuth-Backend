import { Client } from '.prisma/client';
import { ResourceOwner } from '@prisma/client';
import OAuth2Server from 'oauth2-server';
import { URL } from 'url';
import prisma from '../config/prismaClient';
import crypto, { randomBytes } from 'crypto';
import { Request } from 'express';

export const getOAuth2Client = (client: {
  clientId: string;
  redirectUri: string;
  id: number;
}): OAuth2Server.Client => {
  const clientResponse: OAuth2Server.Client = {
    id: client.clientId,
    grants: ['authorization_code'], // only supported grant type
    redirectUris: client.redirectUri,
    primaryKey: client.id
  };

  return clientResponse;
};

export const getOauth2AuthorizationCode = (code: {
  redirectUri: string;
  code: string;
  expireAt: Date;
  scope: string | null;
  client: Client;
  user: ResourceOwner;
}): OAuth2Server.AuthorizationCode => {
  const codeResponse: OAuth2Server.AuthorizationCode = {
    authorizationCode: code.code,
    expiresAt: code.expireAt,
    scope: code.scope as string,
    client: getOAuth2Client(code.client),
    user: code.user,
    redirectUri: code.redirectUri
  };
  return codeResponse;
};

export const getOauth2accessToken = (token: {
  token: OAuth2Server.Token;
  client: OAuth2Server.Client;
  user: OAuth2Server.User;
}): OAuth2Server.Token => {
  const TokenResponse: OAuth2Server.Token = {
    accessToken: token.token.accessToken,
    accessTokenExpiresAt: token.token.accessTokenExpiresAt,
    scope: token.token.scope,
    client: token.client,
    user: token.user
  };
  return TokenResponse;
};

export const buildUrl = (uri: string, searchparams: any) => {
  const myUrl = new URL(uri);
  for (const property in searchparams) {
    myUrl.searchParams.append(property, searchparams[property]);
  }
  return myUrl;
};

// saves state, code challenge and nonce in db
export const saveStateCodeChallengeAndNonce = async (
  code: string,
  data: any
): Promise<boolean> => {
  try {
    const state = data.state;
    const nonce = data.nonce;
    const codeChallenge = data.code_challenge;
    const codeChallengeMethod = data.code_challenge_method;
    await prisma.code.update({
      where: {
        code: code
      },
      data: {
        nonce: nonce,
        state: state
      }
    });
    if (codeChallenge) {
      const codeId = await prisma.code.findUnique({
        where: {
          code: code
        }
      });
      await prisma.codechallenge.create({
        data: {
          codeChallenge: codeChallenge as string,
          codeChallengeMethod: codeChallengeMethod as string,
          codeId: (codeId as any).id,
          expireAt: new Date(Date.now() + 36000000)
        }
      });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const saveStateAndNonce = async (
  code: string,
  state: string,
  nonce: string
): Promise<boolean> => {
  try {
    await prisma.code.update({
      where: {
        code: code
      },
      data: {
        nonce: nonce,
        state: state
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const isAuthorizedApp = async (
  clientId: number,
  userId: number
): Promise<boolean> => {
  try {
    const app = await prisma.authorisedApps.findUnique({
      where: {
        clientId_userId: {
          clientId: clientId,
          userId: userId
        }
      }
    });
    if (!app) return false;
    return true;
  } catch (error: any) {
    throw new Error(error);
  }
};

// to verify the code challenge for PKCE based on code challenge methods(plain and S256)
export const verifyCodeChallenge = async (
  code: string,
  codeVerifier: string
): Promise<boolean> => {
  try {
    const codeData: any = await prisma.code.findUnique({
      where: {
        code: code
      },
      select: {
        codeChallenge: true
      }
    });
    if (!codeData) return false;
    if (codeData.codeChallenge.codeChallengeMethod === 'plain') {
      if (codeData.codeChallenge.codeChallenge == codeVerifier.toString()) {
        await prisma.codechallenge.delete({
          where: {
            codeChallenge: codeData.codeChallenge.codeChallenge as string
          }
        });
        return true;
      }
    } else if (codeData.codeChallenge.codeChallengeMethod === 'S256') {
      const hashedCodeVerifier = await crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('hex');
      if (codeData.codeChallenge.codeChallenge == hashedCodeVerifier) {
        await prisma.codechallenge.delete({
          where: {
            codeChallenge: codeData.codeChallenge.codeChallenge as string
          }
        });
        return true;
      }
    }
    return false;
  } catch (error: any) {
    throw new Error(error);
  }
};

// check if a token request contains `client-secret` to
// differentiate between public clients(ex : android app) and private clients(the one can use client secret ex : web server)
export const isPublicClientTokenReq = (req: Request): boolean => {
  if (req.body.client_secret) return false;

  return true;
};

// used to generate access token
export const generateRandomToken = (): string => {
  const buffer = randomBytes(256);
  return crypto.createHash('sha1').update(buffer).digest('hex');
};
