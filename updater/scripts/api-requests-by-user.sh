#!/bin/bash

#
# Count number of API calls per user
#

for i in {00..23}
do
  grep "now=\"$1T$i" /var/log/github/unicorn.log?? | grep request_category=api | grep -oP 'current_user=\K\S+' | grep -v ^nil$ | sort | uniq -c | sort -rn | head -20 | awk -v i=$i '{ printf("%s,%s,%s\n", i, $2, $1) }'
done
