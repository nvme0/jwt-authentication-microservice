# JWT Authentication Microservice

An authentication microservice for generating a short-lived access token and a long-lived refresh token. Refresh tokens are stored in a Redis Cache, this gives the ability for a user's account to be logged out preventing them from generating new access tokens.

The purpose of this microservice is to handle authentication seperately from a main server-side application. It is not intended to be client facing.

## Installation

```bash
  npm install
```

### Requirements

- A database compatible with `typeorm` (this repository supports MySQL or MariaDB out of the box)

- Redis

- Docker (optional)

### Environment Variables

Create a `.env` and `.env.dev` file with the following format:

```bash
APP_PORT=<PORT>
APP_HOST=http://localhost
NODE_ENV=<development || production>
DB_TYPE=<mysql || mariadb>
DB_HOST=<localhost || db || etc...>
DB_PORT=<PORT>
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
JWT_ACCESS_SECRET=<hash>
JWT_ACCESS_AGE_S=<number>
JWT_REFRESH_SECRET=<hash>
JWT_REFRESH_AGE_S=<number>
REDIS_HOST=<localhost || redis || etc...>
REDIS_PORT=<PORT>
```

## Running the app

```bash
# development
  npm run start

# watch mode
  npm run start:dev

# production mode
  npm run start:prod
```

### GraphQL Playground

In development mode, GraphQL playground is accessible at the URL `APP_HOST:APP_PORT/graphql`

## Test

```bash
# unit tests
  npm run test

# e2e tests
  npm run test:e2e

# test coverage
  npm run test:cov
```

## API

This repository uses a GraphQL API.

### Mutations

#### Registration

```ts
register(email: String!, password: String!) {
  status
  errors {
    path
    message
  }
  payload
}
```

#### Login

```ts
login(email: String!, password: String!) {
  status
  errors {
    path
    message
  }
  payload
}
```

After a sucessfull login, the `payload` will contain a stringified JSON object of the form:

```json
{
  "access_token": "",
  "refresh_token": ""
}
```

#### Refresh

Your application needs to be able to validate access tokens without using this microservice. When a user makes a request with an expired access token, automatically make a request to this microservice to generate a new access token. On success, fullfill the user's original request and send them a new access token with the response. The whole process should be seemless for the user unless their refresh token has expired, in this case prompt the user to login again.

In the HTTP headers include the following:

```json
{
  "authorization": "Bearer <refresh_token>"
}
```

If a valid access token is provided, then you will recieve a response of the form:

```json
"data": {
  "refresh": "access_token"
}
```

Use the access token in your application to authorize the user.

#### Logout

Refresh tokens are stored in a Redis Cache. Cache expiry is the same as what is set for the refresh token. When a `logout` mutation is preformed, it will delete the current entry in the cache.

After a user has logged out their refresh token is no longer valid; however, existing access tokens are still valid for use in your application. It is for this reason that it's recommended to set the access tokens to a short duration.

### Queries

#### me

Using a user's access token you can request the user's `id`, `email` and whether their account has been `confirmed` (accounts are confirmed by default).

```ts
me {
  id
  email
  confirmed
}
```

In the HTTP headers include the following:

```json
{
  "authorization": "Bearer <access_token>"
}
```

## License

This project is [MIT licensed](LICENSE).
