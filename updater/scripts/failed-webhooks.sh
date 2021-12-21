#!/bin/bash
#
# List failed webhooks
#
echo -e "hook_id\ttype\thost\tmessage\tcount"

zcat -f /var/log/syslog.1* |
	# Remove the leading time stamp
	cut --characters 17- |
	# Remove the host name
	cut --delimiter ' ' --fields 2- |
	# Only look for messages from hookshot-go
	grep '^hookshot-go\[' |
	grep 'hook_id=[^ ]' |
	grep -v 'status=200' |
	perl -ne 'print if s/.*parent=([^ ]+)-.*hook_id=([^ ]+).*dest_url=([^ ]+).*public_error_message="(.*)".*/\2\t\1\t\3\t\4/' |
	sort |
	uniq -ic |
	sort -rn |
	perl -pne 's/^\s*([0-9]+)\s(.*)/\2\t\1/'
