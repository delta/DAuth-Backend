# syntax=docker/dockerfile:1

FROM node:14.16.1
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD ./docker-entry.sh