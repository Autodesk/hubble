#!/bin/bash

#
# Count number of API calls per route
#

echo -e "type\tcount"

zcat -f /var/log/github/unicorn.log.1* |
    grep -F 'request_category=api' |
    grep -Fv 'remote_address=127.0.0.1' |
    grep "repo=$REPOSITORY " |
    grep -oP 'route=\K\S+' |
    grep -Fvx 'nil' |
    sort |
    uniq -ic |
    sort -rn |
    head -20 |
    awk '{ printf("%s\t%s\n", $2, $1) }'
