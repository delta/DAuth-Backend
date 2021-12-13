// https://oauth2-server.readthedocs.io/en/latest/model/spec.html# refer for more details :)

import OAuth2Server, { Falsey } from 'oauth2-server';
import prisma from '../config/prismaClient';
import {
  getOauth2accessToken,
  getOauth2AuthorizationCode,
  getOAuth2Client
} from '../utils/oauth';
// handler to retrieve a token.client using a client id or a client id/client secret combination
const getClient = async (
  clientId: string,
  clientSecret: string | null
): Promise<OAuth2Server.Client | Falsey> => {
  const queryParams: any = { clientId };
  if (clientSecret) queryParams.clientSecret = clientSecret;

  try {
    // retriving client from db
    const client = await prisma.client.findFirst({
      where: queryParams,
      select: {
        id: true,
        clientId: true,
        redirectUri: true
      }
    });

    if (!client) return null;
    return getOAuth2Client(client);
  } catch (error) {
    return null;
  }
};

const getAuthorizationCode = async (
  authorizationCode: string
): Promise<OAuth2Server.AuthorizationCode | Falsey> => {
  try {
    const code = await prisma.code.findUnique({
      where: {
        code: authorizationCode
      },
      select: {
        code: true,
        expireAt: true,
        redirectUri: true,
        scope: true,
        client: true,
        user: true
      }
    });

    if (!code) return null;
    return getOauth2AuthorizationCode(code);
  } catch (error) {
    return null;
  }
};

const saveToken = async (
  token: OAuth2Server.Token,
  client: OAuth2Server.Client,
  user: OAuth2Server.User
): Promise<OAuth2Server.Token | null> => {
  try {
    await prisma.token.create({
      data: {
        accessToken: token.accessToken,
        expireAt: token.accessTokenExpiresAt as Date,
        scope: token.scope as string,
        userId: user.id,
        clientId: client.primaryKey
      }
    });
    return getOauth2accessToken({ token, client, user });
  } catch (error) {
    console.log(error);
    return null;
  }
};

const saveAuthorizationCode = async (
  code: OAuth2Server.AuthorizationCode,
  client: OAuth2Server.Client,
  user: OAuth2Server.User
): Promise<OAuth2Server.AuthorizationCode | Falsey> => {
  try {
    await prisma.code.create({
      data: {
        userId: user.id,
        clientId: client.primaryKey,
        code: code.authorizationCode,
        scope: code.scope as string,
        redirectUri: code.redirectUri,
        expireAt: code.expiresAt
      }
    });

    const response: OAuth2Server.AuthorizationCode = {
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client,
      user
    };

    return response;
  } catch (error) {
    return null;
  }
};

const revokeAuthorizationCode = async (
  code: OAuth2Server.AuthorizationCode
): Promise<boolean> => {
  try {
    await prisma.code.delete({
      where: {
        code: code.authorizationCode
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

const getAccessToken = async (
  accessToken: string
): Promise<OAuth2Server.Token | Falsey> => {
  try {
    const token = await prisma.token.findUnique({
      where: {
        accessToken: accessToken
      },
      select: {
        client: true,
        accessToken: true,
        scope: true,
        user: true,
        expireAt: true
      }
    });
    if (!token) return null;

    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.expireAt,
      scope: token.scope,
      client: getOAuth2Client(token.client),
      user: token.user
    };
  } catch (error) {
    return null;
  }
};

const verifyScope = async (
  token: OAuth2Server.Token,
  scope: string
): Promise<boolean> => {
  if (!token.scope) {
    return false;
  }
  const requestedScopes = scope.split(' ');
  const authorizedScopes = (token.scope as string).split(' ');
  return requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
};

export default {
  revokeAuthorizationCode,
  saveAuthorizationCode,
  saveToken,
  getAuthorizationCode,
  getClient,
  getAccessToken,
  verifyScope
};
