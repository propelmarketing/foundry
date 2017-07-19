#!/usr/bin/env bash
# EC2 BeforeInstall hook bash script

set -e

source ~/.bash_profile

# Update instance pkg manager definitions
sudo yum update -y

# Ensure that pm2 in memory process is up-to-date
pm2 update
