#!/usr/bin/env bash

set -e

source ~/.bash_profile

sleep 5
nc -zv 0.0.0.0 3000
