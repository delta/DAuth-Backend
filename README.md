# Delta oauth2.0 service provider
## Prerequisites
 - nodejs
 - mysql

## Setup
- install dependencies
  
    ```
    npm ci
    ```
- database and migrations
  
    ```
    npx prisma migrate dev
    ```
- Run  `cp .env.example .env`
- fill in the database credentials in the .env file
- Run  `npm run dev`