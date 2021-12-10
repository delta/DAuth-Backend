interface oauthError {
  code: number;
  name: string;
  error_description: string;
}

export class OAuthError {
  invalidRequestError = (e: string): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'invalid_request',
      error_description: e
    };

    return error;
  };

  invalidClientError = (): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'invalid_client',
      error_description: 'Invalid client: client is invalid'
    };

    return error;
  };

  unSupportedGrantError = (): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'unsupported_grant_type',
      error_description: 'Unsupported grant type: `grant_type` is invalid'
    };

    return error;
  };

  inValidGrantError = (e: string): oauthError => {
    const error: oauthError = {
      code: 400,
      name: 'unsupported_grant_type',
      error_description: e
    };

    return error;
  };

  internalServerError = (): oauthError => {
    const error: oauthError = {
      code: 500,
      name: 'internal_server_error',
      error_description: 'internal server error'
    };

    return error;
  };
}
