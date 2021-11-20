import OAuth2Server, {
  ServerOptions,
  UnauthorizedRequestError
} from 'oauth2-server';
import { NextFunction, Request, Response } from 'express';

/**
  express wrapper for oauth2-server
  similiar to express-oauth-server(https://www.npmjs.com/package/express-oauth-server)

  authenticate() |
  authorize()    |-> oauth2-server
  token()        |

  these methods of oauth2-server are wrapped into middleware
 */
class ExpressOAuthServer {
  server: OAuth2Server;
  options: ServerOptions;

  constructor(options: ServerOptions) {
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

  // token for a authorization_code  :)
  token = (
    options?: OAuth2Server.TokenOptions
  ): ((
    request: Request,
    response: Response,
    next: NextFunction
  ) => void | Response) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const request = new OAuth2Server.Request(req);
      const response = new OAuth2Server.Response(res);
      this.server
        .token(request, response, options)
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
