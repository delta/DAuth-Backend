# syntax=docker/dockerfile:1

FROM node:14.16.1
WORKDIR /app
ENV NODE_ENV=production
COPY ["package.json","package-lock.json*" ,"./"]
RUN npm i -g npm  && npm --production=false ci && npm install -g prisma
COPY . .
CMD ./docker-entry.sh