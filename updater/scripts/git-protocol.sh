#!/bin/bash
#
# Count the number of connections per Git protocol
#
echo -e "Git protocol\tconnections"

zcat -f /var/log/babeld/babeld.log.1* |
	perl -ne 'print if s/.*proto=([^ ]+).*/\1/' |
	sort |
	uniq -c |
	awk '{printf("%s\t%s\n",$2,$1)}'

