#!/bin/bash

declare -A projects=(
    ["graphql-server"]="/projects/graphql-server"
    ["db-seed"]="/projects/db-seed"
    ["cron-jobs"]="/projects/cron-jobs"
    ["client"]="/projects/client"
    ["infra-lib"]="/packages/infra"
    ["db-schemas-lib"]="/packages/db-schemas"
    ["e2e-tests"]="/tests/e2e-tests"
)

# Get root directory
root_dir="$(git rev-parse --show-toplevel)"

# Install the latest version of npm-check-updates
npm i -g npm-check-updates

# Checkout to a new branch
git checkout -b update-dependencies

# For every npm project
for key in "${!projects[@]}"; do
  printf "%s\n" "$key"
    # Chenge directory
    cd "${root_dir}/${projects[$key]}"
    # Check of updates
    npm-check-updates -u
    # Install Updates
    npm i
    # Commit Changes
    git commit -am "Maint: Update dependencies for $key" # includes project name
done