import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = express();
dotenv.config();

// Routers
import authRouter from './routes/auth';

import { initialisePassport } from './config/passport';

const port = process.env.PORT;

// Helmet Middleware
app.use(helmet());

// cors Middleware
app.use(cors());

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  })
);

// Initialise Passport
initialisePassport(app);

// Authentication Routes
app.use('/auth', authRouter);

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
