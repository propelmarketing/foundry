#!/bin/bash
# Deploy nginx & vhost configuration

set -e

source /home/ec2-user/.bash_profile

if [ ! -d "/etc/nginx" ]; then
  yum install nginx -y
fi

service nginx stop

APPLICATION="<server>"
AWS_S3_CP="aws s3 cp"
AWS_S3_LS="aws s3 ls"
CONF_AGENCY_TEMPLATE="/home/ec2-user/<server>/config/nginx/agency.conf.template"
CONF_AGENCY_TEMPLATE_KEY="<agency>"
CONF_DIR="/etc/nginx/conf.d"
CONF_EXT="conf"
CONF_NGINX="/home/ec2-user/<server>/config/nginx/nginx.conf"
CONF_ROOT_URI="s3://th-config/$APPLICATION/$NODE_ENV/agencies"
CONF_SUBDOMAN_TEMPLATE_KEY="<subdomain>"
SSL_DIR="/etc/ssl"
SERVER_CERT_EXT="crt"
SERVER_KEY_EXT="key"
TARGET_NGINX_CONF="/etc/nginx/nginx.conf"

# ----- Determine if the agency certificate are available -----
# Using the AWS CLI, reach out to S3 and list the .pem and .key file in the corresponding agency directory
# If the files are there, return 1; otherwise return 0
# ---------------------------
areCertsAvailable() {
  PEM_COUNT=$($AWS_S3_LS $1 | wc -l)
  KEY_COUNT=$($AWS_S3_LS $2 | wc -l)
  [ $PEM_COUNT -gt 0 ] && [ $KEY_COUNT -gt 0 ]
}

# ----- Build the nginx conf -----
# Copy the nginx conf template file in the <server> configuration directory to the nginx directory
# Replace/update any content inside the copied nginx conf file if necessary
# ---------------------------
buildNginxConf() {
  cp -f $CONF_NGINX $TARGET_NGINX_CONF
  if [ $? -ne 0 ]; then
    echo "Failed to transfer nginx configuration" && exit 1
  fi
}

# ----- Build the vHost conf -----
# Copy the agency conf template file in the <server> configuration directory to the nginx conf.d directory
# Replace/update any content inside the copied agency conf file if necessary
# ---------------------------
buildVirtualHostNginxConf() {
  cp -f "$CONF_AGENCY_TEMPLATE" "$2"
  if [ $? -ne 0 ]; then
    echo "Failed to transfer nginx configuration for agency $1"
    return 1
  fi

  sed -i "s/$CONF_AGENCY_TEMPLATE_KEY/$1/gi" "$2"
  if [ $? -ne 0 ]; then
    echo "Failed to update agency name in vhost nginx configuration for agency $1"
    return 1
  fi

  if [ "$DEPLOYMENT_GROUP_NAME" = "qa" ]; then
    SUBDOMAIN="qa-login"
  else
    SUBDOMAIN="login"
  fi

  sed -i "s/$CONF_SUBDOMAN_TEMPLATE_KEY/$SUBDOMAIN/gi" "$2"
  if [ $? -ne 0 ]; then
    echo "Failed to update agency name in vhost nginx configuration for agency $1"
    return 1
  fi
  return 0
}

clean() {
  echo "Cleaning up agency $1..."
  rm -rf "$SSL_DIR/$1"
  rm -rf "$2"
}

# ----- Create the agency certificate directory -----
# Given the agnecy name, create the similarly-named directory under the ssl root dir
# ---------------------------
createAgencyCertDir() {
  echo "Creating $SSL_DIR/$1..."
  mkdir -p "$SSL_DIR/$1"
  [ -d "$SSL_DIR/$1" ]
}

# ----- Transfer the agency key files -----
# Using the AWS CLI, reach out to S3 and retrieve the .key file in the corresponding agency directory
# If the command fails, return a 1; otherwise return 0
# ---------------------------
transferKeyFile() {
  echo "Executing $AWS_S3_CP $1 $2..."
  RET=$($AWS_S3_CP $1 $2)
  [ -f "$2" ]
}

# ----- Transfer the agency crt files -----
# Using the AWS CLI, reach out to S3 and retrieve the .crt file in the corresponding agency directory
# If the command fails, return a 1; otherwise return 0
# ---------------------------
transferCrtFile() {
  echo "Executing $AWS_S3_CP $1 $2..."
  RET=$($AWS_S3_CP $1 $2)
  [ -f "$2" ]
}

# Build the global Nginx configuration file
buildNginxConf

# ----- Build the vHost Conf -----
# Loop through all the available Agencies and build the virtual host configuration on the instance
# ---------------------------
AGENCIES=`$AWS_S3_LS "$CONF_ROOT_URI/" | tr -d ' \t\r\f/' | grep "^PRE" | tr -d 'PRE'`
SAVEIFS=$IFS
IFS=$'\n'
AGENCIES=($AGENCIES)
IFS=$SAVEIFS

for (( i=0; i<${#AGENCIES[@]}; i++ )); do
  # Grab the Agency from the list
  AGENCY=${AGENCIES[$i]}
  echo "Processing agency: $AGENCY..."

  # Build the agency-specific nginx conf file
  TARGET_AGENCY_CONF="$CONF_DIR/$AGENCY.$CONF_EXT"

  # Agency Certificate file (.pem) source and target
  SRC_PEM_FILE="$CONF_ROOT_URI/$AGENCY/$AGENCY.$SERVER_CERT_EXT"
  TARGET_PEM_FILE="$SSL_DIR/$AGENCY/$AGENCY.$SERVER_CERT_EXT"

  # Agency Certificate private key file (.key) source and target
  SRC_KEY_FILE="$CONF_ROOT_URI/$AGENCY/$AGENCY.$SERVER_KEY_EXT"
  TARGET_KEY_FILE="$SSL_DIR/$AGENCY/$AGENCY.$SERVER_KEY_EXT"

  # If the certificates are in the s3 bucket, copy down the cert files and build the vhost nginx conf file
  if areCertsAvailable "$SRC_PEM_FILE" "$SRC_KEY_FILE"; then

    # Create the cert directory
    if createAgencyCertDir "$AGENCY"; then

      # If the cert directory was completed, transfer the PEM file down from s3
      if ! transferCrtFile "$SRC_PEM_FILE" "$TARGET_PEM_FILE"; then
        echo "Failed to transfer certificate file for agency $AGENCY"
        clean "$AGENCY" "$TARGET_AGENCY_CONF" && continue
      fi

      # If the PEM file was successfully transfered, then transfer the key file down from s3
      if ! transferKeyFile "$SRC_KEY_FILE" "$TARGET_KEY_FILE"; then
        echo "Failed to transfer certificate key file for agency $AGENCY"
        clean "$AGENCY" "$TARGET_AGENCY_CONF" && continue
      fi

      # If the key file was successfully transfered, then build the virtual host nginx conf file
      if ! buildVirtualHostNginxConf "$AGENCY" "$TARGET_AGENCY_CONF"; then
        clean "$AGENCY" "$TARGET_AGENCY_CONF" && continue
      fi

    else
      echo "Failed to create the certificate directory '$SSL_DIR/$AGENCY' for agency $AGENCY"
    fi
  else
    echo "No virtual host configuration found for agency $AGENCY"
  fi
done

sudo service nginx restart
