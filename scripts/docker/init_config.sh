#!/usr/bin/env bash

# Load the production config
LOCAL_CONFIG_FILE_NAME="local.json"
if [ ! -z "$DEVELOPER" ]; then
  BUCKET="$APPLICATION/$DEVELOPER/$NODE_ENV"
else
  BUCKET="$APPLICATION/$NODE_ENV"
fi

LOCAL_CONFIG_LOCATION="/usr/local/src/$APPLICATION/config/server/$LOCAL_CONFIG_FILE_NAME"
S3_URI="s3://th-config/$BUCKET/$LOCAL_CONFIG_FILE_NAME"

EXISTS=`aws s3 ls "$S3_URI"`
if [ -z "$EXISTS" ]; then
  echo "No local.json to download for $S3_URI" && exit 0
fi

aws s3 cp "$S3_URI" "$LOCAL_CONFIG_LOCATION"
if [ $? -ne 0 ]; then
  echo "The command 'aws s3 cp "$S3_URI" "$LOCAL_CONFIG_LOCATION"' failed" && exit 1
fi

if [ ! -f "$LOCAL_CONFIG_LOCATION" ]; then
  echo "Failed to download the correct config ($LOCAL_CONFIG_FILE_NAME) file!" && exit 1
fi

if [ "$NODE_ENV" == "dev" ]; then
  yarn run sequelize migrate db:migrate
fi
