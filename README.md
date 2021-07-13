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


## Authorization Code Flow
![authorization code flow dance](https://github.com/siva2204/DAuth-Backend/blob/node-oauth2-int/public/images/flow-dm.png)

### Authorize endpoint
```HTTP
POST /oauth/authorize HTTP/1.1
Host: localhost:3001
Content-Type: application/x-www-form-urlencoded

client_id=qwdsfgwrTHNHRMYUKTILY&redirect_uri=https%3A%2F%2Fstackoverflow.com%2F&response_type=code&grant_type=authorization_code&state=sdafsdghb&scope=email+openid+profile&nonce=bscsbascbadcsbasccabs
```

### Token endpoint
```HTTP
POST /oauth/token HTTP/1.1
Host: localhost:3001
Content-Type: application/x-www-form-urlencoded

client_id=qwdsfgwrTHNHRMYUKTILY&client_secret=csadvfbgnrwmywtkulifjrknjvnjrnlrnjvlnfvnflv&grant_type=authorization_code&code=f65dbf63a96650e689ef9f800a63ed67177ebe45&redirect_uri=https%3A%2F%2Fstackoverflow.com%2F
```

### key endpoint

```HTTP
GET /oauth/oidc/key HTTP/1.1
Host: localhost:3001
```

### Accepted Scopes
- email
- profile
- openid
- user
  