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
else
  echo "DEPLOYMENT_GROUP_NAME is not set - cannot continnue" && exit 1
fi

cd ~/<server>
yarn install --production

# add <server> to startup
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
  sudo sh -c "echo 'su -l $USER -c \"cd ~/<server>/scripts/ec2;sh ./start.sh\"' >> /etc/rc.d/rc.local"
fi
