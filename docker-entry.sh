#!/bin/bash

npm install -g prisma
# migration
prisma migrate dev
# build and run app
npm start