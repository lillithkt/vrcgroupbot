#!/bin/bash
set -e

EXIT_CODE=0
while true; do
    node .
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 42 ]; then
        exit $EXIT_CODE
    fi
    echo "Restarting process due to exit code $EXIT_CODE..."
done
