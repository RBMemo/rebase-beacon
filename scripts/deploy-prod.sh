#!/bin/sh

echo "=> building"
docker compose -f compose.yml -p rb-rebase-beacon build

echo "=> fetching ECR credentials"
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 016619982582.dkr.ecr.us-west-2.amazonaws.com

echo "=> pushing to ECR"
docker compose -f compose.yml -p rb-rebase-beacon push

echo "=> deploying"
docker --context nooki-ecs compose -f compose.yml -p rb-rebase-beacon up
