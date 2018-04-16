#!/bin/bash

#
# Count number of API calls per user
#

echo -e "user\trequests"

zcat -f /var/log/github/unicorn.log.1* |
    grep request_category=api |
    grep -oP 'current_user=\K\S+' |
    grep -v ^nil$ |
    sort |
    uniq -c |
    sort -rn |
    head -20 |
    awk '{ printf("%s\t%s\n", $2, $1) }'
