<div align="center"><a><img src="./.github/documentation/logo.png"></a></div>

------

## Status

[![Continuous Integration - On Merge to Main](https://github.com/jayc13/scipio-project/actions/workflows/on-merge-continuous-integration.yml/badge.svg?branch=main)](https://github.com/jayc13/scipio-project/actions/workflows/on-merge-continuous-integration.yml)

[![Continuous Integration - On Deployment](https://github.com/jayc13/scipio-project/actions/workflows/on-deployment-continuos-integration.yml/badge.svg?branch=main)](https://github.com/jayc13/scipio-project/actions/workflows/on-deployment-continuos-integration.yml)

[![CodeQL](https://github.com/jayc13/scipio-project/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/jayc13/scipio-project/actions/workflows/github-code-scanning/codeql)

## Requirements

**Supported operating systems**:

- Ubuntu LTS/Debian 9.x
- CentOS/RHEL 8
- macOS Mojave
- Docker

**Node:**

- Recommended: 20.x
- Minimum: 18.x

**MongoDB:**

- Minimum: 5.1

------

## Getting Started

**Environment Vars**
> For more details check on the Development section of each service

 - `FIREBASE_PROJECT_ID`
 - `FIREBASE_CLIENT_EMAIL`
 - `FIREBASE_PRIVATE_KEY`
 - `FIREBASE_API_KEY`
 - `FIREBASE_AUTH_DOMAIN`
 - `FIREBASE_APP_ID`

```shell
docker compose up --detach --wait --build
```

------

## Development

### Client

> **Folder:** `/projects/client`

**Install Dependencies**

```shell
npm install
```

**Start Client**

```shell
npm run start
```

**Environment Vars**

| Var                         | Type   | Required | Default Value           | Description         |
|-----------------------------|--------|----------|-------------------------|---------------------|
| `VITE_FIREBASE_API_KEY`     | String | `true`   |                         | Firebase Credential |
| `VITE_FIREBASE_AUTH_DOMAIN` | String | `true`   |                         | Firebase Credential |
| `VITE_FIREBASE_PROJECT_ID`  | String | `true`   |                         | Firebase Credential |
| `VITE_FIREBASE_APP_ID`      | String | `true`   |                         | Firebase Credential |
| `VITE_API_BASE_URL`         | String | `true`   | `http://localhost:8080` | API base url        |

### Server

> **Folder:** `/projects/graphql-server`

**Install Dependencies**

```shell
npm install
```

**Start Server**

```shell
npm run dev
```

**Environment Vars**

| Var                     | Type    | Required | Default Value | Description                                           |
|-------------------------|---------|----------|---------------|-------------------------------------------------------|
| `FIREBASE_CLIENT_EMAIL` | String  | `true`   |               | Firebase Credential                                   |
| `FIREBASE_PRIVATE_KEY`  | String  | `true`   |               | Firebase Credential                                   |
| `FIREBASE_PROJECT_ID`   | String  | `true`   |               | Firebase Credential                                   |
| `MONGO_DB_URI`          | String  | `true`   |               | Database connection string                            |
| `REDIS_URI`             | String  | `true`   |               | Redis connection string                               |
| `NODE_ENV`              | String  | `false`  |               | Indicates the environment where the server is running | 
| `WEB_URL`               | String  | `true`   |               | Url to the client's public url                        | 

------

## Database

MongoDB is used as Database.

------

## DB Seed

Backups are stored in Azure Containers data storage.

> **Folder:** `/projects/db-seed`

**Automatic Executions**

Environments: 
- Staging:
  - On every push to main

**Install Dependencies**

```shell
npm install
```

**Build Project**

```shell
npm run build
```

**Run Seed**

```shell
npm run start
```

**Environment Vars**

| Var                 | Type   | Required | Default Value | Description                                        |
|---------------------|--------|----------|---------------|----------------------------------------------------|
| `MONGO_DB_URI`      | String | `true`   |               | Database connection string                         |
| `LOG_LEVEL`         | String | `false`  | `info`        | Available values: `debug`, `info`, `warn`, `error` | 
| `USER_FIREBASE_ID`  | String | `true`   |  `""`         | Firebase ID of the demo user                       |

------

## Cron Jobs

Backups are stored in Azure Containers data storage.

> **Folder:** `/projects/cron-jobs`

**Jobs**

Environments: 
- Credit Card Expiration:
  - Every Day at 00:00hs

**Install Dependencies**

```shell
npm install
```

**Build Project**

```shell
npm run build
```

**Start Jobs**

```shell
npm run start
```

**Tests**

```shell
npm run test
```

**Environment Vars**

| Var                 | Type   | Required | Default Value | Description                                        |
|---------------------|--------|----------|---------------|----------------------------------------------------|
| `MONGO_DB_URI`      | String | `true`   |               | Database connection string                         |
| `REDIS_URI`         | String | `true`   |               | Redis connection string                            |
| `LOG_LEVEL`         | String | `false`  | `info`        | Available values: `debug`, `info`, `warn`, `error` |
| `EMAIL_SENDER`      | String | `true`   |               | Email address that send the emails                 |
| `EMAIL_AUTH_DOMAIN` | String | `true`   |               | Domain of the smtp server                          |
| `EMAIL_AUTH_PORT`   | String | `true`   |               | Port of the smtp server                            |
| `EMAIL_AUTH_USER`   | String | `true`   |               | User credentials                                   |
| `EMAIL_AUTH_PASS`   | String | `true`   |               | User credentials                                   |

------

## License

This project is licensed under the terms of the **GPL-3.0** license.

> You can check out the full license [GPL-3.0](./LICENSE) license.

## Update Dependencies

1. Move to the project directory

2. Check for update and apply the changes

```shell
npx npm-check-updates -u
```

3. Install the updates

```shell
npm install
```
