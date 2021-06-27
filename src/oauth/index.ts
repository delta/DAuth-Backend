import ExpressOAuthServer from './server';
import model from './model';

// oauth2 server instance to couple with our routes as middlewares
export default new ExpressOAuthServer({
  model: model,
  allowEmptyState: false,
  allowExtendedTokenAttributes: true,
  accessTokenLifetime: 60 * 60 * 24 // 24 hours, or 1 day
});
