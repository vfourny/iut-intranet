#!/bin/bash
set -e

cd "$(dirname "$0")"

COMPOSE="docker compose -f docker/prod.compose.yml --env-file .env"

$COMPOSE down --remove-orphans
$COMPOSE build
$COMPOSE up -d
