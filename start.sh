#!/bin/bash

# Start script for unified deployment
echo "Starting Onetimer services..."

# Set default ports
export BACKEND_PORT=${BACKEND_PORT:-8080}
export FRONTEND_PORT=${PORT:-3000}

# Start unified backend (includes all filler functionality)
echo "Starting unified backend on port $BACKEND_PORT..."
PORT=$BACKEND_PORT ./backend-main &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on port $FRONTEND_PORT..."
cd frontend
PORT=$FRONTEND_PORT node server.js &
FRONTEND_PID=$!

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?