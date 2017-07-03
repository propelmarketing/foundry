#!/usr/bin/env bash
# EC2 ApplicationStop hook bash script

source ~/.bash_profile

cd ~/arbiter
pm2 stop arbiter
pm2 kill
