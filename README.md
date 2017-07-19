<server>
============

## Description
## Architecture
### Providers
### Database
### Middleware
### Server

## Deployment

<b>IMPORTANT:</b> <server> <em>requires</em> the use of yarnpkg (https://yarnpkg.com/lang/en/docs/install/)

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
