#!/bin/bash

#
# List failed webhooks
#

echo -e "hook_id\ttype\thost\tmessage\tcount"

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
    zcat -f /var/log/syslog.1* | grep hookshot-go |
        grep 'hook_id=[^ ]' |
        grep -v 'status=200' |
        perl -ne 'print if s/.*parent=([^ ]+)-.*hook_id=([^ ]+).*dest_url=([^ ]+).*public_error_message="(.*)".*/\2\t\1\t\3\t\4/' |
        sort |
        uniq -ic |
        sort -rn |
        perl -pne 's/([0-9]+)\s(.*)/\2\t\1/'
else
    # check yesterday's log file pre 3.0.0
    zcat -f /var/log/hookshot/exceptions.log.1* |
        jq --slurp '.[] | del(.backtrace) | {hook_id,service_host,message,class,parent}' |
        jq --slurp -c 'sort_by(.hook_id) | .[] | {id: .hook_id,url: .service_host, data: (.parent|tostring), msg: .message}' |
        # remove this part as it's not real JSON and breaks the remaining chain
        sed -e 's/{\\"url[^}]*}, //' |
        # this can probably be done more elegantly
        jq -r -c --slurp '.[] | "\(.id)\t\((.data|tostring|fromjson)[0] | sub("-[0-9]+"; ""))\t\(.url)\t\(.msg)"' |
        sort |
        uniq -ic |
        sort -rn |
        perl -pne 's/([0-9]+)\s(.*)/\2\t\1/'
fi