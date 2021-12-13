interface oauthError {
  code: number;
  name: string;
  error_description: string;
}

export class OAuthError {
  protected invalidRequestError = (e: string): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'invalid_request',
      error_description: e
    };

    return error;
  };

  protected invalidClientError = (): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'invalid_client',
      error_description: 'Invalid client: client is invalid'
    };

    return error;
  };

  protected unSupportedGrantError = (): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'unsupported_grant_type',
      error_description: 'Unsupported grant type: `grant_type` is invalid'
    };

    return error;
  };

  protected inValidGrantError = (e: string): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'unsupported_grant_type',
      error_description: e
    };

    return error;
  };

  protected internalServerError = (): oauthError => {
    const error: oauthError = {
      code: 500,
      name: 'internal_server_error',
      error_description: 'internal server error'
    };

    return error;
  };
}
