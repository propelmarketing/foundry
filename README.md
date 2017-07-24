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
