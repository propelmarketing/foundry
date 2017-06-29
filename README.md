Arbiter
============
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f056b46535d441d18d9d7a78916f4f86)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=propelmarketing/server&amp;utm_campaign=Badge_Grade) [![CircleCI](https://circleci.com/gh/propelmarketing/arbiter.svg?style=svg&circle-token=16667f90ebd396fea6203aa9876f73592bfa668c)](https://circleci.com/gh/propelmarketing/arbiter)

## Description

Login with facebook:
  - TODO

Login with google:
  In order to use Google's OpenID to log into the CAS, a User must first login using their username and
  password, then link their account with a Google Account. To link their account, a User must hit the
  linking endpoint with their sessions active. This associates the User with the Google Account they
  selected on Google's OpenID Authorization screen. Once linked, a User will be able to select their
  linked Google Account to login rather than providing a username/password pair.

We have multiple types of users:
  - Customers (User)
  - Staff (User)
  - Agencies

  - Customers and Agency information should be contained inside one database
  - Staff information should be contained inside a AD server

When a user attempts to login to one of the Thrivehive apps using a local strategy,
the CAS shall verify the Application CLIENT_ID to verify that
the app is a registered or authorized application. If so, then:
  - If the client is requesting a refresh token, the CAS will engage in the standard OAuth token refresh flow.
  - The CAS will examine the Cookie Jar for an existing auth token.
    - If no such token exists, then the CAS will proceed with the
      OAuth Client Password auth scheme with a pre-defined expiration.
      The CAS will store this token for further SSO capabilities.
    - Otherwise, the CAS will verify token validity and either
      allow or deny access.
When a user attempts to login to one of the Thrivehive apps using either Facebook or Google,
the CAS shall forward the auth request to Facebook or Google.
If access if permitted by these external providers, then the CAS
will utilize the provided auth information to find a user in the
corresponding profile databases. If no user exists, then a profile
is created. The CAS will then store the external provider auth
token to use for further SSO capabilities. If no expiration is
attached to the external provider auth token, the CAS will set
one internally.

The CAS has the following responsibilities:
  - To use the OAuth2 specification to authorize users to access both internal and external Thrivehive applications
  - To provide an authentication endpoint for Thrivehive customers, reps, and staff members
  - To forward authentication requests to external providers to obtain valid OAuth2 tokens

If an external provider does not use OAuth2, then the CAS is responsible for converting and mapping  the authorization
scheme of the external provider to an internal OAuth2 token.

## Architecture
### Providers
### Database
### Middleware
### Server

## Deployment

<b>IMPORTANT:</b> Arbiter <em>requires</em> the use of yarnpkg (https://yarnpkg.com/lang/en/docs/install/)

### PM2 Deployment Server Configuration

For clean target environments:
- Have pm2 installed globally
  ```
  yarn global add pm2
  ```
- Must be able to clone from the Arbiter github repo
- A ssh key has been generated specifically for deployment access, the keys has been uploaded to CircleCI, and the public key has been added to the target server's ~/.ssh/authorized_keys
- From a local machine, run the following commands to initialize the pm2 environment on the target server:
  ```
  ./node_modules/.bin/pm2 deploy <environment_key> setup
  ```
  Where <environment_key> is either production or qa, depending on the purpose of the server

### Admin Console
- Installation
  The Forest Admin Lumber microservice points to the database specified in the .env file. To install, first copy
  the .env template, update the values to point to the proper Arbiter database, then run:
  ```
  cd admin/
  yarn install
  cd ..
  ```

- Running
  This will start the Lumber microserver and allow you to hit the ForestAdmin cloud app to access the Admin Console.
  ```
  yarn admin
  ```

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
