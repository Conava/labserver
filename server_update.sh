#!/bin/bash

# Function to update the server.sh using SSL
update_with_ssl() {
    # Try to pull from the git repository using SSL
    git pull git@git.informatik.uni-hamburg.de:base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/webserver.git
}

# Function to update the server.sh using username and password
update_with_username_password() {
    # Read the username and password
    echo "Enter your git username:"
    read username
    echo "Enter your git password:"
    read -s password

    # Try to pull from the git repository using username and password
    git pull https://$username:$password@git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/webserver.git
}

# Try to update the server.sh using SSL
if update_with_ssl; then
    echo "Server updated successfully using SSL."
else
    echo "Failed to update the server using SSL. Falling back to username and password."
    # If it fails, fall back to using username and password
    update_with_username_password
fi