#!/usr/bin/env bash

set -e

# Store and change to the root directory of the git repository
pushd "$(git rev-parse --show-toplevel)" > /dev/null

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Error: Version argument is required"
    echo "Usage: $0 <version>"
    popd > /dev/null
    exit 1
fi

VERSION=$1

# Update version in all workspaces without creating git tags
npm version $VERSION --workspaces --no-git-tag-version

# Create a commit with the version
git add .
git commit -m "v$VERSION"

# Create a git tag
git tag -a "v$VERSION" -m "v$VERSION"

echo "Version $VERSION has been set, committed, and tagged"

# Return to the original directory
popd > /dev/null