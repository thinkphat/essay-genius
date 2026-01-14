#!/usr/bin/env bash

KEYWORD="$1"

if [ -z "$KEYWORD" ]; then
  echo "Usage: $0 <keyword>"
  exit 1
fi

echo "Keyword: $KEYWORD"
echo "----------------------------------"

# 1. Tìm containers dùng image có keyword
CONTAINERS=$(docker ps -a \
  --format "{{.ID}} {{.Image}}" |
  grep "$KEYWORD" |
  awk '{print $1}')

if [ -n "$CONTAINERS" ]; then
  echo "Stopping containers..."
  docker stop $CONTAINERS

  echo "Removing containers..."
  docker rm $CONTAINERS
else
  echo "No containers found."
fi

# 2. Tìm images có keyword
IMAGES=$(docker images \
  --format "{{.ID}} {{.Repository}}:{{.Tag}}" |
  grep "$KEYWORD" |
  awk '{print $1}')

if [ -n "$IMAGES" ]; then
  echo "Removing images..."
  docker rmi -f $IMAGES
else
  echo "No images found."
fi

echo "Done."

