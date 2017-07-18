#!/usr/bin/env bash
# EC2 ApplicationStart hook bash script

source ~/.bash_profile

if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
fi

# Load the production config
LOCAL_CONFIG_FILE_NAME="local.json"
LOCAL_CONFIG_LOCATION="/home/ec2-user/<server>/config/server/$LOCAL_CONFIG_FILE_NAME"
S3_URI="s3://th-config/<server>/$DEPLOYMENT_GROUP_NAME/$LOCAL_CONFIG_FILE_NAME"
aws s3 cp "$S3_URI" "$LOCAL_CONFIG_LOCATION"
if [ $? -ne 0 ]; then
  echo "The command 'aws s3 cp "$S3_URI/$LOCAL_CONFIG_FILE_NAME" "$LOCAL_CONFIG_LOCATION"' failed" && exit 1
fi

if [ ! -f "$LOCAL_CONFIG_LOCATION" ]; then
  echo "Failed to download the correct config ($LOCAL_CONFIG_FILE_NAME) file!" && exit 1
fi

cd ~/<server>
yarn start
