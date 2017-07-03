#!/usr/bin/env bash
# EC2 ApplicationStart hook bash script

source ~/.bash_profile

if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
fi

cd ~/arbiter
yarn start
