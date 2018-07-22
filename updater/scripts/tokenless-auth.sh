#!/bin/bash
#
# Lists users that make the most requests with username/password
# c.f. https://help.github.com/enterprise/2.11/admin/guides/user-management/using-ldap/#disabling-password-authentication-for-git-operations
#

function ghe_greater_equal () {
    cat /etc/github/enterprise-release |
        perl -sne '
            use version;
            my ($installed) = $_ =~ /RELEASE_VERSION="([0-9]+([.][0-9]+)+)"/;
            exit (version->parse($installed) lt version->parse($required));
        ' -- -required="$1"
    return $?
}

echo -e "user\trepository\ttokenless authentications"

# The log file format changed with 2.12, and some of the fields might appear in inconsistent order now
if ghe_greater_equal "2.12.0"
then
	zcat -f /var/log/github/gitauth.log.1* |
		grep -v 'hashed_token' |
		grep 'proto=http' |
		grep 'status=200' |
		perl -ne 'print if s/^(?=.*member="?([^ "]+))(?=.*path=([^ ]+)\.git).*/\1 \2/' |
		sort |
		uniq -ic |
		sort -rn |
		awk '{gsub(/[_.]/, "-", $2); printf("%s\t%s\t%s\n",$2,$3,$1)}'
else
	zcat -f /tmp/gitauth.log.1* |
		perl -ne 'print if s/.*status=OK member="?([^ "]+) hashed_token=nil.*path=([^ ]+)\.git .*proto=http.*/\1 \2/' |
		sort |
		uniq -ic |
		sort -rn |
		awk '{gsub(/[_.]/, "-", $2); printf("%s\t%s\t%s\n",$2,$3,$1)}'
fi
