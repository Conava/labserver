#!/bin/bash

# Function to display help information
display_help() {
    echo "Usage: ./server.sh [command] [argument]"
    echo ""
    echo "Commands:"
    echo "  start [port]    Start the server on the specified port (default: 443, 80 if no SSL certificate is found"
    echo "  stop            Stop the server"
    echo "  restart [port]  Restart the server on the specified port (default: 443, 80 if no SSL certificate is found)"
    echo "  help            Display this help message"
}

# Function to start the server
start_server() {
    # Check if the script is run with sudo privileges
    if [ "$EUID" -ne 0 ]; then
        echo "Please run the start command as root or with sudo privileges."
        exit 1
    fi

    # Check if the server is already running
    if pgrep -f "node server.js" > /dev/null; then
        echo "The server is already running."
        exit 1
    fi

    local port=${1:-443}  # Use the first argument as the port number, or 443 (80 without SSL certificate) if no argument is provided
    echo "Starting the server on port $port..."
    nohup node server.js "$port" > output.log 2>&1 &
    echo "Server started successfully on port $port."
    echo "Output is redirected to output.log."
}

# Function to stop the server
stop_server() {
    echo "Stopping the server..."
    pkill -f "node server.js"
    echo "Server stopped successfully."
}

# Function to restart the server
restart_server() {
    local port=${1:-443}  # Use the first argument as the port number, or 443 (80 without SSL certificate) if no argument is provided
    echo "Restarting the server on port $port..."
    stop_server
    start_server $port
    echo "Server restarted successfully on port $port."
}

# Check the command-line argument
if [ "$1" = "start" ]; then
    start_server $2
elif [ "$1" = "stop" ]; then
    stop_server
elif [ "$1" = "restart" ]; then
    restart_server $2
elif [ "$1" = "help" ]; then
    display_help
else
    echo "Invalid argument. Please use 'start', 'stop', or 'restart'."
fi