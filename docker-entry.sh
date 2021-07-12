#!/bin/sh

# migration
prisma migrate dev
# build & run app
npm start
