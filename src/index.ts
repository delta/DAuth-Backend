import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

const app: Application = express();
dotenv.config();

const port = process.env.PORT;

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
