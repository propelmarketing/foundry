Server Name
============

## Description

## Architecture
### Providers
### Database
### Middleware
### Server

## Deployment
### Admin Console
- Installation
  ```
  cd admin/
  yarn install
  cd ..
  ./node_modules/.bin/lumber generate
  ```

- Running
  This will start the Lumber microserver and allow you to hit the ForestAdmin cloud app to access the Admin Console
  ```
  npm run admin
  ```

### Development
- Installation
  ```
  yarn install
  ```

- Running
  This will build and run the server in watch mode
  TODO update this flow with watch ability
  ```
  npm run build-dev
  npm start
  ```

### Production
- Installation & Build
  ```
  yarn install production
  npm build
  ```

- Running:
  To run the server in any mode other than 'developer', either set NODE_ENV manually
  locally or globally prior to executing the following command:
  ```
  npm start
  ```

### Docker
  TODO
