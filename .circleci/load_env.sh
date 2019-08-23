#!/bin/sh

echo '
export GITHUB_REPO=jessestuart/docker-hub-tracker
export IMAGE=docker-hub-tracker
export REGISTRY=jessestuart
export VERSION=$(curl -s https://api.github.com/repos/jessestuart/docker-hub-tracker/releases/latest | jq -r ".tag_name")
export DIR=`pwd`
export QEMU_VERSION="v4.0.0"
' >>$BASH_ENV

. $BASH_ENV
