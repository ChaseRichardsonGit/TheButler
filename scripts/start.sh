#!/bin/bash

# Define the list of persona names
personas=("Butler" "Puerus" "Melfi" "Deadass" "Ganjalf" "Pusher" "HodlLlama")

# Loop through each persona and create a new screen with a unique name
for personaName in "${personas[@]}"
do
    echo "Creating screen with name $personaName"
    screen -dmS "$personaName"
done

# Loop through each persona again and run the desired command in the corresponding screen
for personaName in "${personas[@]}"
do
    echo "Running command 'node index.js $personaName' in screen $personaName"
    screen -S "$personaName" -X stuff $"node scripts/../index.js $personaName\n"
done