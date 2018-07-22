#!/bin/bash
#
# Count number of Git repository requests per day
#
echo -e "repository\tsource IP\trequests"

zcat -f /var/log/babeld/babeld.log.1* |
    perl -ne 'print if s/.*ip=([^ ]+).*repo=([^ ]+).*/\1 \2/' |
    sort |
    uniq -ic |
    sort -rn |
    awk '{printf("%s\t%s\t%s\n",$3,$2,$1)}'
