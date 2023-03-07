#!/bin/bash

# Define the list of persona names
personas=("Butler" "Puerus" "Melfi" "Deadass" "Ganjalf" "PusherAI" "HodlLlama")

# Loop through each persona and create a new screen with a unique name
for personaName in "${personas[@]}"
do
    screen -dmS "$personaName"
done

# Loop through each persona again and run the desired command in the corresponding screen
for personaName in "${personas[@]}"
do
    screen -S "$personaName" -X stuff $"node index.js $personaName\n"
done
