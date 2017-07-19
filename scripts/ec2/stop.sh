#!/usr/bin/env bash
# EC2 ApplicationStop hook bash script

source ~/.bash_profile

cd ~/<server>
pm2 stop <server>
pm2 kill
