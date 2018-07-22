#!/bin/bash
#
# Count number of API calls per type and user/org/repo (resource)
#
echo -e "resource\ttype\tsource IP\trequests"

zcat -f /var/log/haproxy.log.1* |
    perl -ne 'print if s/.*haproxy\[\d+\]: ([^:]+).*\/api\/v3\/([^\/\? ]+)\/([^\/\? ]+?(\/[^\/\? ]+)).*/\1 \2 \3/' |
    grep -v '^127.0.0.1' |
    sort |
    uniq -ic |
    sort -rn |
    awk '{printf("%s\t%s\t%s\t%s\n",$4,$3,$2,$1)}'
