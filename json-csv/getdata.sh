#!/bin/bash

npx -p node-firestore-import-export firestore-export -a SECRET_credentials.json -b backup.json && make && ./jsoncsv
