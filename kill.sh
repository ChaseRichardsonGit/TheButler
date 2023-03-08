#!/bin/bash

# Get a list of all detached screen sessions
sessions=$(screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}')

# Loop through each session and terminate it
for session in $sessions; do
    screen -S "$session" -X quit
done
