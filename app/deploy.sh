#!/usr/bin/env bash
echo $1
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy ozcoin-$1 --settings ../galaxy-$1.json --debug

#DEPLOY_HOSTNAME=galaxy.meteor.com meteor authorized ozcoin-mainnet.meteorapp.com --transfer ozcoininc