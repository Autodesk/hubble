#!/bin/bash
#
# Count number of Git repository requests per day
#
echo -e "repository\tsource IP\trequests"

zcat -f /var/log/syslog.1* |
	# Remove the leading time stamp
	cut --characters 17- |
	# Remove the host name
	cut --delimiter ' ' --fields 2- |
	# Only look for messages from babeld
	grep '^babeld\[' |
	perl -ne 'print if s/.*ip=([^ ]+).*repo=([^ ]+).*/\1 \2/' |
	sort |
	uniq -ic |
	sort -rn |
	awk '{printf("%s\t%s\t%s\n",$3,$2,$1)}'
