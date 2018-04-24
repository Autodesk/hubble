#!/bin/bash

#
# Count number of API calls per user
#

echo -e "user\trequests"

zcat -f /var/log/github/unicorn.log.1* |
    grep -F 'request_category=api' |
    grep -Fv 'remote_address=127.0.0.1' |
    grep -oP 'current_user=\K\S+' |
    grep -Fvx 'nil' |
    sort |
    uniq -c |
    sort -rn |
    head -20 |
    awk '{ printf("%s\t%s\n", $2, $1) }'
