#!/bin/bash
set -e

echo "Starting the application..."

EXIT_CODE=0
while true; do
    node /dist/index.js
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 42 ]; then
        exit $EXIT_CODE
    fi
    echo "Restarting process due to exit code $EXIT_CODE..."
done
