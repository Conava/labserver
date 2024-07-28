#!/bin/sh

IMAGE_NAME="your_dockerhub_username/your_image_name"
CONTAINER_NAME="your_container_name"

# Pull the latest image
docker pull $IMAGE_NAME:latest

# Get the ID of the latest image
LATEST_IMAGE_ID=$(docker images -q $IMAGE_NAME:latest)

# Get the ID of the currently running image
CURRENT_IMAGE_ID=$(docker inspect --format="{{.Image}}" $CONTAINER_NAME)

# Compare the image IDs
if [ "$LATEST_IMAGE_ID" != "$CURRENT_IMAGE_ID" ]; then
  echo "New image found. Updating..."
  # Stop the current container
  docker stop $CONTAINER_NAME
  # Remove the current container
  docker rm $CONTAINER_NAME
  # Run a new container with the latest image
  docker run -d --name $CONTAINER_NAME $IMAGE_NAME:latest
else
  echo "No new image found. Running the current version."
fi