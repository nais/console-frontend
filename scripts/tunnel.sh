#!/bin/bash

CLUSTER=$1
NAMESPACE=$2
SERVICE=$3

# Validate input
if [ -z "$CLUSTER" ] || [ -z "$NAMESPACE" ] || [ -z "$SERVICE" ]; then
	echo "Usage: $0 <cluster> <namespace> <service>"
	exit 1
fi

while true; do
    echo "Starting port-forwarding..."
	kubectl --context "$CLUSTER" --namespace "$NAMESPACE" port-forward svc/"$SERVICE" 3000:80 --request-timeout 2m

    echo "Port-forwarding crashed. Restarting in 2 seconds..."
    sleep 2
done
