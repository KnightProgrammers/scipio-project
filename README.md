<h1 align="center">
    <a>
        <img src="./.github/documentation/logo.png">
    </a>
</h1>

<p align="center">
    <a href="https://github.com/jayc13/scipio-project/actions/workflows/continuous-integration.yml"><img src="https://github.com/jayc13/scipio-project/actions/workflows/continuous-integration.yml/badge.svg?branch=main" alt="Continuous Integration"></a>
    <a href="https://opensource.org/licenses/GPL-3.0"><img src="https://img.shields.io/badge/License-GPL-blue.svg" alt="License: GPL-3.0"></a>
</p>

<p align="center">
  <i align="center"></i>
</p>

------

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

> **Folder:** `/client`

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

> **Folder:** `/server`

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
| `MONGO_DB_PROTOCOL`     | String  | `false`  | `mongodb`     | Database connection protocol                          |
| `MONGO_DB_HOST`         | String  | `false`  | `localhost`   | Database connection host                              |
| `MONGO_DB_PORT`         | String  | `false`  |               | Database connection port                              |
| `MONGO_DB_NAME`         | String  | `false`  |               | Database name                                         |
| `MONGO_DB_USER`         | String  | `false`  |               | Database connection credential                        |
| `MONGO_DB_PASSWORD`     | String  | `false`  |               | Database connection credential                        |
| `MONGO_DB_PARAMS`       | String  | `false`  |               | Database connection configuration params              | 
| `NODE_ENV`              | String  | `false`  |               | Indicates the environment where the server is running | 

------

## Database

MongoDB is used as Database.

------

## DB Seed

Backups are stored in Azure Containers data storage.

> **Folder:** `/db-seed`

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

**Run Backup**

```shell
npm run start
```

**Environment Vars**

| Var                 | Type   | Required | Default Value | Description                                        |
|---------------------|--------|----------|---------------|----------------------------------------------------|
| `MONGO_DB_PROTOCOL` | String | `false`  | `mongodb`     | Database connection protocol                       |
| `MONGO_DB_HOST`     | String | `false`  | `localhost`   | Database connection host                           |
| `MONGO_DB_PORT`     | String | `false`  |               | Database connection port                           |
| `MONGO_DB_NAME`     | String | `false`  |               | Database name                                      |
| `MONGO_DB_USER`     | String | `false`  |               | Database connection credential                     |
| `MONGO_DB_PASSWORD` | String | `false`  |               | Database connection credential                     |
| `MONGO_DB_PARAMS`   | String | `false`  |               | Database connection configuration params           | 
| `LOG_LEVEL`         | String | `false`  | `info`        | Available values: `debug`, `info`, `warn`, `error` | 

------

## License

This project is licensed under the terms of the **GPL-3.0** license.

> You can check out the full license [GPL-3.0](./LICENSE) license.
