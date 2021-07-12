#!/bin/sh

npm install -g prisma
# migration
prisma migrate dev
# build & run app
npm start