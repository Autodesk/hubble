#!/bin/bash
#
# Count the number of successful connections per Git protocol
#
echo -e "Git protocol\tconnections"

zcat -f /var/log/babeld/babeld.log.1* |
	perl -ne 'print if s/.*proto=([^ ]+).*op done.*/\1/' |
	sort |
	uniq -c |
	awk '{printf("%s\t%s\n",$2,$1)}'
