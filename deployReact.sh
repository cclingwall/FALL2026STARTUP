#!/bin/bash

while getopts k:h:s: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    echo "Missing required parameter (-k <key> -h <host> -s <service>)"
    echo "Example: ./deployReact.sh -k ~/keys/production.pem -h yourdomain.click -s startup"
    exit 1
fi

echo "Deploying React bundle to $hostname..."

# 1. Clean and build the production bundle
npm run build

# 2. Clear old files on the server target directory
ssh -i "$key" ubuntu@"$hostname" "rm -rf services/$service/public/*"

# 3. Copy the compiled dist folder contents to the server
scp -r -i "$key" dist/* ubuntu@"$hostname":services/$service/public/