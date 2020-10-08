#!/bin/ash

# The updater establishes a SSH connection to the GHES appliance.
# Store the fingerprint of the GHES host to avoid interactive authenticity
# confirmation.
mkdir ~/.ssh
python3 -c 'from config import *; import os; os.system("ssh-keyscan -p 122 -H " + configuration["remoteRun"]["gheHost"] + " >~/.ssh/known_hosts")'

# Run the updater via cron
crond -f
