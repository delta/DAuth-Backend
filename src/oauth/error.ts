interface oauthError {
  code: number;
  name: string;
  message: string;
}

export class OAuthError {
  protected invalidRequestError = (e: string): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'invalid_request',
      message: e
    };

    return error;
  };

  protected invalidClientError = (): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'invalid_client',
      message: 'Invalid client: client is invalid'
    };

    return error;
  };

  protected unSupportedGrantError = (): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'unsupported_grant_type',
      message: 'Unsupported grant type: `grant_type` is invalid'
    };

    return error;
  };

  protected inValidGrantError = (e: string): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'unsupported_grant_type',
      message: e
    };

    return error;
  };

  protected internalServerError = (): oauthError => {
    const error: oauthError = {
      code: 500,
      name: 'internal_server_error',
      message: 'internal server error'
    };

    return error;
  };
}
