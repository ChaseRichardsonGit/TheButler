#!/bin/bash

echo "Executing git fetch"
git fetch
echo "Output of git fetch:"
echo ""

echo "Executing git pull"
git pull
echo "Output of git pull:"
echo ""

echo "Executing ./kill.sh"
./kill.sh
echo "Output of ./kill.sh:"
echo ""

echo "Executing ./start.sh"
./start.sh
echo "Output of ./start.sh:"
echo ""