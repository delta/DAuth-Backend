import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = express();
dotenv.config();

// Routers
import authRouter from './routes/auth';
import oauthRouter from './routes/oauth';
import keyRoute from './routes/key';
import clientRouter from './routes/client';
import dashboardRoute from './routes/dashboard'


import { initialisePassport } from './config/passport';

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

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  })
);

// Initialise Passport
initialisePassport(app);

// Authentication Routes
app.use('/auth', authRouter);

// OAuth Routes
app.use('/oauth', oauthRouter);

// Key Routes
app.use('/oauth/oidc', keyRoute);

// Client Routes
app.use('/client', clientRouter);

//Dashboard Routes
app.use('/user', dashboardRoute);

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
