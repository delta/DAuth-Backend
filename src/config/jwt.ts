import jose from 'jose';
const {
  JWK: { generateSync }
} = jose;
// jwk for id token encryption and validation
const key = generateSync('RSA', 2048, { use: 'sig', alg: 'RS256' });

export const publicJwk = key.toJWK();

export const privateJwk = key.toJWK(true);
