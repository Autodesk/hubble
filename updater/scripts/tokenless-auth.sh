#!/bin/bash
#
# Lists users that make the most requests with username/password
# c.f. https://help.github.com/enterprise/2.11/admin/guides/user-management/using-ldap/#disabling-password-authentication-for-git-operations
#
echo -e "User\tRepository\tTokenless Authentications/Day"

zcat -f /var/log/github/gitauth.log.1* |
    perl -ne 'print if s/.*status=OK member="?([^ "]+) hashed_token=nil.*path=([^ ]+)\.git .*proto=http.*/\1 \2/' |
    sort |
    uniq -c |
    sort -rn |
    awk '{printf("%s\t%s\t%s\n",$2,$3,$1)}'
