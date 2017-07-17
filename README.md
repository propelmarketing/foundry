<server>
============
[![CircleCI](https://circleci.com/gh/propelmarketing/<server>.svg?style=svg&circle-token=16667f90ebd396fea6203aa9876f73592bfa668c)](https://circleci.com/gh/propelmarketing/<server>)

## Description
## Architecture
### Providers
### Database
### Middleware
### Server

## Deployment

<b>IMPORTANT:</b> <server> <em>requires</em> the use of yarnpkg (https://yarnpkg.com/lang/en/docs/install/)

### PM2 Deployment Server Configuration

For clean target environments:
- Have pm2 installed globally
  ```
  yarn global add pm2
  ```
- Must be able to clone from the <server> github repo
- A ssh key has been generated specifically for deployment access, the keys has been uploaded to CircleCI, and the public key has been added to the target server's ~/.ssh/authorized_keys
- From a local machine, run the following commands to initialize the pm2 environment on the target server:
  ```
  ./node_modules/.bin/pm2 deploy <environment_key> setup
  ```
  Where <environment_key> is either production or qa, depending on the purpose of the server

### Development
- Installation
  ```
  yarn install
  ```

- Running
  This will build and run the server in watch mode.
  ```
  yarn watch
  ```

  You may also build a developmental image (non-watch) using:
  ```
  yarn build-dev
  ```
  This will build a debug image to the dist/ folder.

### QA
  <em>NOTE:</em> <b>The QA server is production server for all QA server-based logins. Deployments to this server will be off of
  master. If you wish to QA a different branch, then do not use the Deployment step - rather login to the QA server, checkout your repo, and deploy/stat manually.</b>

- Prereqs:

  The target server has been properly configured & initialized.

- Installation & Build
  ```
  yarn install production
  ```

- Running
  Do not run locally. To run on the QA server manually, run:
  ```
  yarn start
  ```

- Deployment
  CircleCI deploys production images to AWS. See circle.yml for more details.

### Production
- Prereqs:

  The target server has been properly configured & initialized.

- Installation & Build
  ```
  yarn install production
  ```

- Running
  Do not run locally

- Deployment
  CircleCI deploys production images to AWS. See circle.yml for more details.

  TODO Deployment
  - do any updates to admin?
