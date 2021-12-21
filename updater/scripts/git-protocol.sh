#!/bin/bash
#
# Count the number of successful connections per Git protocol
#
echo -e "Git protocol\tconnections"

zcat -f /var/log/syslog.1* |
	# Remove the leading time stamp
	cut --characters 17- |
	# Remove the host name
	cut --delimiter ' ' --fields 2- |
	# Only look for messages from babeld
	grep '^babeld\[' |
	perl -ne 'print if s/.*proto=([^ ]+).*op done.*/\1/' |
	sort |
	uniq -c |
	awk '{printf("%s\t%s\n",$2,$1)}'
