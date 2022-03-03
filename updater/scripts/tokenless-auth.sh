#!/bin/bash
#
# Lists users that make the most requests with username/password
# c.f. https://help.github.com/enterprise/2.11/admin/guides/user-management/using-ldap/#disabling-password-authentication-for-git-operations
#

echo -e "user\trepository\ttokenless authentications"

# The log file format changed with 2.12, and some of the fields might appear in inconsistent order now
zcat -f /var/log/github/gitauth.log.1* |
	grep -v 'hashed_token' |
	grep 'proto=http' |
	grep 'status=200' |
	perl -ne 'print if s/^(?=.*member="?([^ "]+))(?=.*path=([^ ]+)\.git).*/\1 \2/' |
	sort |
	uniq -ic |
	sort -rn |
	awk '{gsub(/[_.]/, "-", $2); printf("%s\t%s\t%s\n",$2,$3,$1)}'
