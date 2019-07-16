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

# Returns success (bash exit code 0) if the GHE version is in a given range.
# The first value of the range is inclusive and last value exclusive.
# For example, 'ghe_between 2.11.4 2.12.2' returns 0 (success) for the values
# 2.11.4, 2.11.5, ..., and 2.12.1, while 1 (failure) is returned for 2.12.2.
function ghe_between () {
    ghe_greater_equal "$1" && ! ghe_greater_equal "$2"
}

if ghe_between "2.11.0" "2.11.6" ; then
    # The "github-audit.log" log file introduced in GHE 2.11.0 was only rolled
    # once a week until 2.11.6 [1]. Work around the bug by grepping for all log
    # entries in the two most recent log files (because the information from
    # yesterday may or not be rotated already).
    #
    # [1] https://enterprise.github.com/releases/2.11.6/notes
    CAT_LOG_FILE="zcat -f /var/log/github-audit.{log.1*,log} | grep -F '$(date --date='yesterday' +'%b %_d')'"
elif ghe_greater_equal "2.11.0"; then
    # check yesterday's log file post 2.11
    CAT_LOG_FILE="zcat -f /var/log/github-audit.log.1*"
else
    # check yesterday's log file pre 2.11
    CAT_LOG_FILE="zcat -f /var/log/github/audit.log.1*"
fi

if ghe_greater_equal "2.12.0" ; then
    # Starting from GHE 2.12.0 the fields in github-audit.log are sorted
    # alphabetically
    printf -v EXTRACT_FIELDS "%s"               \
        'print if s/.*'                         \
            '"cloning":([^,]+).*'               \
            '"program":"upload-pack".*'         \
            '"repo_name":"([^"]+).*'            \
            '"uploaded_bytes":([^,]+).*'        \
            '"user_login":"([^"]+).*'           \
        '/\2\t\4\t\1\t\3/'
else
    printf -v EXTRACT_FIELDS "%s"               \
        'print if s/.*'                         \
            '"program":"upload-pack".*'         \
            '"repo_name":"([^"]+).*'            \
            '"user_login":"([^"]+).*'           \
            '"cloning":([^,]+).*'               \
            '"uploaded_bytes":([^ ]+).*'        \
        '/\1\t\2\t\3\t\4/'
fi

echo -e "repository\tuser\tcloning?\trequests\tdownload [B]"

eval "$CAT_LOG_FILE" |
    perl -ne "$EXTRACT_FIELDS" |
    sort |
    perl -ne '$S{$1} += $2 and $C{$1} += 1 if (/^(.+)\t(\d+)$/);END{printf("%s\t%i\t%i\n",$_,$C{$_},$S{$_}) for ( keys %S );}' |
    sort -rn -k5,5
