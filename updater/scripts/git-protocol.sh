#!/bin/bash
#
# Count the number of successful connections per Git protocol
#
echo -e "Git protocol\tconnections"

function ghe_greater_equal () {
    cat /etc/github/enterprise-release |
        perl -sne '
            use version;
            my ($installed) = $_ =~ /RELEASE_VERSION="([0-9]+([.][0-9]+)+)"/;
            exit (version->parse($installed) lt version->parse($required));
        ' -- -required="$1"
    return $?
}

if ghe_greater_equal "3.0.0"; then
    # check yesterday's log file post 3.0.0
    CAT_LOG_FILE="zcat -f /var/log/syslog.1* | grep babeld"
else
    # check yesterday's log file pre 3.0.0
    CAT_LOG_FILE="zcat -f /var/log/babeld/babeld.log.1*"
fi

eval "${CAT_LOG_FILE}" |
	perl -ne 'print if s/.*proto=([^ ]+).*op done.*/\1/' |
	sort |
	uniq -c |
	awk '{printf("%s\t%s\n",$2,$1)}'
