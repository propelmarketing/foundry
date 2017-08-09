<server>
============

## Description
## Architecture
### Providers
### Database
### Middleware
### Server

## Usage
- Adding Foundry to Your Repo

  Make sure to have all untracked files moved or removed in your repository's working branch, then run
  ```
  git remote add foundry https://github.com/propelmarketing/foundry.git
  ```
  ```
  git pull foundry master --allow-unrelated-histories
  ```

  If the above command succeeds, then Foundry's master branch will attempt to merge into your repository's
  current working branch. Fix any merge conflicts that result.

  You will also need to replace any instances of `<server>` that appear as they are placeholders for your project's actual name. Mainly the `package.json` in your project's root directory needs the "name" property to be changed or else your project will break.

## Deployment

<b>IMPORTANT:</b> This project <em>requires</em> the use of yarnpkg (https://yarnpkg.com/lang/en/docs/install/)

### Development
- Installation
  ```
  yarn install
  ```

- Building
  This will build and run the server in watch mode.
  ```
  yarn watch
  ```

  You may also build an image (non-watch) using:
  ```
  yarn build
  ```

- Running
  You can use either option to run a local server. The later option will pretty print the logs to the console.
  ```
  yarn run pm2 startOrRestart process.dev.json
  ```

  or

  ```
  node index.js | ./node_modules/.bin/bunyan
  ```

### QA
To perform QA/Testing, follow these steps:
1. `ssh` into the test instance using the following command:
```
ssh -i "Developers.pem" ec2-user@<url>
```

<em>NOTE:</em> The Developers key can be found in dropbox.

2. Navigate to the source code directroy `~/<div>`

3. Checkout and pull your branch you wish to QA

4. Install any dependencis
  ```
  yarn
  ```

5. Build the server
  ```
  yarn build
  ```

6. Start/Restart the server:
  ```
  yarn run pm2 startOrRestart process.dev.json
  ```

7. Verify that the server is running:
  ```
  yarn run pm2 show arbiter
  ```

8. Access `http(s)://<url>:3000`

### Production

- Running
  Do not run locally

- Deployment
  CircleCI deploys production images to AWS. See circle.yml for more details.
