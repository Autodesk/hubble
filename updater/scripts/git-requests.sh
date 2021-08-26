#!/bin/bash
#
# Count number of Git repository requests per day
#
echo -e "repository\tsource IP\trequests"

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
    perl -ne 'print if s/.*ip=([^ ]+).*repo=([^ ]+).*/\1 \2/' |
    sort |
    uniq -ic |
    sort -rn |
    awk '{printf("%s\t%s\t%s\n",$3,$2,$1)}'
