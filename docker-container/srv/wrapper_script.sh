#!/bin/bash
# Run run_chat_server.sh script
./run_chat_server.sh &
echo
# Run Apache
apachectl -D FOREGROUND
