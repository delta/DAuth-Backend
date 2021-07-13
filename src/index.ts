import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = express();
dotenv.config();

// Routers
import authRouter from './routes/auth';
import oauthRouter from './routes/oauth';
import keyRouter from './routes/key';
import clientRouter from './routes/client';
import dashboardRouter from './routes/dashboard';
import resourcesRouter from './routes/resources';

import { initialisePassport } from './config/passport';
import { initSession } from './config/session';

const port = process.env.PORT;

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helmet Middleware
app.use(helmet());

// cors Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ]
  })
);

// Initialise session
initSession(app);

// Initialise Passport
initialisePassport(app);

// Authentication Routes
app.use('/auth', authRouter);

// OAuth Routes
app.use('/oauth', oauthRouter);

// Key Routes
app.use('/oauth/oidc', keyRouter);

// Client Routes
app.use('/client', clientRouter);

//Dashboard Routes
app.use('/user', dashboardRouter);

app.use('/resources', resourcesRouter);

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send('work in progress');
});

try {
  app.listen(port, (): void => {
    console.log(`[server]: up and running on http://localhost:${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
