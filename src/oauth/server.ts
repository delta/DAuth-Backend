import OAuth2Server, {
  ServerOptions,
  UnauthorizedRequestError
} from 'oauth2-server';
import { NextFunction, Request, Response } from 'express';
import { generateRandomToken, isPublicClientTokenReq } from '../utils/oauth';
import model from './model';
import { OAuthError } from './error';

/**
  express wrapper for oauth2-server
  similiar to express-oauth-server(https://www.npmjs.com/package/express-oauth-server)

  authenticate() |
  authorize()    |-> oauth2-server
  token()        |

  these methods of oauth2-server are wrapped into middleware
 */
class ExpressOAuthServer extends OAuthError {
  server: OAuth2Server;
  options: ServerOptions;

  constructor(options: ServerOptions) {
    super();
    this.server = new OAuth2Server(options);
    this.options = options;
  }

  // authenticates the token
  // must be invoked before accessing protected resources
  authenticate = (
    options?: OAuth2Server.AuthenticateOptions
  ): ((
    request: Request,
    response: Response,
    next: NextFunction
  ) => void | Response) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const request = new OAuth2Server.Request(req);
      const response = new OAuth2Server.Response(res);

      this.server
        .authenticate(request, response, options)
        .then((token) => {
          res.locals.token = { token };
          res.set(response.headers);
          next();
        })
        .catch((error) => {
          this.handleError(error, req, res, response);
        });
    };
  };

  // authorize the request for code
  authorize = (
    options?: OAuth2Server.AuthorizeOptions
  ): ((
    request: Request,
    response: Response,
    next: NextFunction
  ) => void | Response) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const request = new OAuth2Server.Request(req);
      const response = new OAuth2Server.Response(res);

      this.server
        .authorize(request, response, options)
        .then((code) => {
          res.locals.code = { code };
          res.locals.location = response.headers?.location;
          res.set(response.headers);
          next();
        })
        .catch((error) => {
          this.handleError(error, req, res, response);
        });
    };
  };

  // this will handle token request for private clients like web application
  // i.e the one that can store clinet secret with them
  privateClientTokenHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void | Response => {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);
    this.server
      .token(request, response)
      .then((token) => {
        res.locals.token = { token };
        res.set(response.headers);
        next();
      })
      .catch((error) => {
        this.handleError(error, req, res, response);
      });
  };

  // this will handle token request for public clients like native apps
  // i.e the one that can't store client secret with them
  publicClientTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      // validation starts --->
      if (!req.is('application/x-www-form-urlencoded'))
        throw this.invalidRequestError(
          'Invalid request: content must be application/x-www-form-urlencoded'
        );

      const { client_id, grant_type, code, redirect_uri } = req.body;

      if (!client_id)
        throw this.invalidRequestError('Missing Parameter: `client_id`');

      if (!code) throw this.invalidRequestError('Missing Parameter: `code`');

      if (!redirect_uri)
        throw this.invalidRequestError('Missing Parameter: `redirect_uri`');

      if (!grant_type)
        this.invalidRequestError('Missing Parameter: `grant_type`');
      // validation ends <---

      // only supported grant
      if (grant_type != 'authorization_code')
        throw this.unSupportedGrantError();

      // client secret will not sent in the request
      // getting the client with the client_id
      const client = await model.getClient(client_id, null);

      if (!client) throw this.invalidClientError();

      // getting authorization code data from db with code sent in the request
      const authorizationCode = await model.getAuthorizationCode(code);

      if (!authorizationCode)
        throw this.inValidGrantError(
          'Invalid grant: authorization code is invalid'
        );

      // validating client
      if (authorizationCode.client.id !== client.id)
        throw this.inValidGrantError(
          'Invalid grant: authorization code is invalid'
        );

      // validating expiration of authorization code
      if (authorizationCode.expiresAt < new Date())
        throw this.inValidGrantError(
          'Invalid grant: authorization code has expired'
        );

      // checking redirectUri mismatch(referred to as callback_url while registering client)
      if (client.redirectUris !== redirect_uri)
        throw this.invalidRequestError(
          'Invaid request: redirect uri is invalid'
        );

      // deleting authorization_code, time to create access token !!
      // authorization_code is one time usable
      const isRevoked = await model.revokeAuthorizationCode(authorizationCode);

      if (!isRevoked)
        throw this.inValidGrantError(
          'Invalid grant: authorization code is invalid'
        );

      // generating random token
      const randToken = generateRandomToken();

      // setting expiry life time for access token
      const accessTokenLifeTime = new Date();

      accessTokenLifeTime.setTime(
        accessTokenLifeTime.getTime() + (this.options.accessTokenLifetime || 0)
      );

      // Token Object
      const accessToken: OAuth2Server.Token = {
        accessToken: randToken,
        accessTokenExpiresAt: accessTokenLifeTime,
        client: authorizationCode.client,
        user: authorizationCode.user,
        scope: authorizationCode.scopes
      };

      // saving token in db with scopes
      const token = await model.saveToken(
        accessToken,
        authorizationCode.client,
        authorizationCode.user
      );

      if (!token) throw this.internalServerError();

      res.locals.token = { token };
      next();

      return;
    } catch (error) {
      return this.handleError(error, req, res, new OAuth2Server.Response(res));
    }
  };

  // token handler handles request for public and private clients request
  tokenHandler = (): ((
    request: Request,
    response: Response,
    next: NextFunction
  ) => void | Response) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!isPublicClientTokenReq(req)) {
        this.privateClientTokenHandler(req, res, next);
      } else {
        this.publicClientTokenHandler(req, res, next);
      }
    };
  };

  // error handler
  handleError = (
    e: any,
    req: Request,
    res: Response,
    response: OAuth2Server.Response
  ): Response => {
    if (response) {
      res.set(response.headers);
    }

    res.status(e.code);

    if (e instanceof UnauthorizedRequestError) {
      return res.send();
    }

    return res.json({ error: e.name, error_description: e.message });
  };
}

export default ExpressOAuthServer;
