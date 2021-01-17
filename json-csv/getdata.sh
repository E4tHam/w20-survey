#!/bin/bash


# Make data directory for jsoncsv
mkdir .data/

# Download backup.json and convert it to CSVs
npx -p node-firestore-import-export firestore-export -a SECRET_credentials.json -b ".backup.json" && ./jsoncsv && zip data.zip -r .data/ && echo "Success!" || echo "Failed."

# Clean directory
rm ".backup.json"
rm -rf ".data/"

# Done
echo "Done."

