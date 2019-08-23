#!/bin/bash

set -eux

if [[ -z $VERSION || "$VERSION" == "null" ]]; then
  export VERSION=$CIRCLE_SHA1
fi
export IMAGE_ID="${REGISTRY}/${IMAGE}:${VERSION}"

# Replace the repo's Dockerfile with our own.
docker build -t ${IMAGE_ID} .

# Login to Docker Hub.
echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin

# Push push push
docker push ${IMAGE_ID}
if [ "$CIRCLE_BRANCH" = 'master' ]; then
  docker tag "${IMAGE_ID}" "${REGISTRY}/${IMAGE}:latest"
  docker push "${REGISTRY}/${IMAGE}:latest"
fi
