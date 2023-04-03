#!/bin/bash

#
# List failed authentication attempts
#

echo -e "user\tcount"

zcat -f /var/log/github/auth.log.1* |
	 grep -hF 'at=failure' |
	 grep -vF 'raw_login=nil' |
	 grep -oP ' login=.+?(?=raw_login)' |
	 grep -v 'https' |
	 grep -vF 'login=nil' |
	 grep -vF 'login=api' |
	 grep -vF 'login=git' |
	 perl -lape 's/login=//' |
	 sort |
	 uniq -ic |
	 sort -rn |
	 awk '{printf("%s\t%s\n",$2,$1)}'
