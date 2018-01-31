#!/bin/bash
#
# Calculate download traffic per day
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

if ghe_greater_equal "2.11.0" ; then
    # The "github-audit.log" log file introduced in GHE 2.11.0 is only rolled
    # once a week. This was reported as a bug and is likely fixed in an
    # upcoming version. In the meantime, we grep for all log entries in the two
    # most recent log files (because the information from yesterday may or not
    # be rotated already).
    CAT_LOG_FILE="zcat -f /var/log/github-audit.{log.1*,log} | grep -F '$(date --date='yesterday' +'%b %_d')'"

    # The order in github-audit.log in GHE 2.12.x has been changed, to pick the right order PERL_REGEX is created.
    PERL_REGEX='print if s/.*"cloning":([^,]+).*"program":"upload-pack".*"repo_name":"([^"]+).*"uploaded_bytes":([^,]+).*"user_login":"([^"]+).*/\2\t\4\t\1\t\3/'

else
    # check yesterday's log file
    CAT_LOG_FILE="zcat -f /var/log/github/audit.log.1*"
    PERL_REGEX='print if s/.*"program":"upload-pack".*"repo_name":"([^"]+).*"user_login":"([^"]+).*"cloning":([^,]+).*"uploaded_bytes":([^ ]+).*/\1\t\2\t\3\t\4/'
fi

echo -e "repository\tuser\tcloning?\trequests/day\tdownload/day [B]"

eval "$CAT_LOG_FILE" |
    perl -ne "$PERL_REGEX" |
    sort |
    perl -ne '$S{$1} += $2 and $C{$1} += 1 if (/^(.+)\t(\d+)$/);END{printf("%s\t%i\t%i\n",$_,$C{$_},$S{$_}) for ( keys %S );}' |
    sort -rn -k5,5
