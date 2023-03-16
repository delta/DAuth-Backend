import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';
import express from 'express';

const redisStore = connectRedis(session);

const isProd = process.env.NODE_ENV === 'production';

export const initSession = (app: express.Application): void => {
  if (isProd) {
    //Configure redis client
    const redisClient = redis.createClient({
      host: process.env.REDIS_HOST as string,
      port: parseInt(process.env.REDIS_PORT as string),
      password: process.env.REDIS_PASS as string
    });

    redisClient.on('error', (err) => {
      console.log('Redis error: ', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to redis successfully');
    });

    app.use(
      session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days,
        },
        store: new redisStore({ client: redisClient })
      })
    );

    return;
  }

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
};
