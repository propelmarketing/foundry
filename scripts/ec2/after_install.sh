#!/usr/bin/env bash
# EC2 AfterInstall hook bash script

set -e

source ~/.bash_profile

# setup NODE_ENV
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
  export NODE_ENV=$DEPLOYMENT_GROUP_NAME

  hasEnv=`grep "export NODE_ENV" ~/.bash_profile | cat`
  if [ -z "$hasEnv" ]; then
    echo "export NODE_ENV=$DEPLOYMENT_GROUP_NAME" >> ~/.bash_profile
  else
    sed -i "/export NODE_ENV=\b/c\export NODE_ENV=$DEPLOYMENT_GROUP_NAME" ~/.bash_profile
  fi
fi

cd ~/arbiter
yarn install --production

# add arbiter to startup
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
  sudo sh -c "echo 'su -l $USER -c \"cd ~/arbiter/scripts/ec2;sh ./start.sh\"' >> /etc/rc.d/rc.local"
fi

# Load the production config
cd ~/arbiter/config
CONFIG_FILE="local.json"
S3_URI="s3://th-config/arbiter/$DEPLOYMENT_GROUP_NAME"
aws s3 cp "$S3_URI/$CONFIG_FILE" "$CONFIG_FILE"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Failed to download the correct config ($CONFIG_FILE) file!" && exit 1
fi

cd ~
