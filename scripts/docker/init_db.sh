#!/bin/bash

export NODE_ENV=test
yarn run sequelize db:migrate
