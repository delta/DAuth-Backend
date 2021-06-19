import OAuth2Server, { ServerOptions } from 'oauth2-server';
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
  // must be invoked before accessing resources
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
          next();
        })
        .catch((error) => {
          console.log(error);
          return res.status(error.status || 500).json({ error });
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
          //TODO: don't forget redirect to client with authorization_code
          next();
        })
        .catch((error) => {
          console.log(error);
          return res.status(error.status || 500).json({ error });
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
          //TODO: send id token with the response
          next();
        })
        .catch((error) => {
          console.log(error);
          return res.status(error.status || 500).json({ error });
        });
    };
  };
}

export default ExpressOAuthServer;
