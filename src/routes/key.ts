import express, { Router, Request } from 'express';
import { publicJwk } from '../config/jwt';
const router: Router = express.Router();

// public key route to validate id token(jwt)
router.get('/key', (req, res) => {
  const key = [publicJwk];
  return res.status(200).json({ key });
});

export default router;
