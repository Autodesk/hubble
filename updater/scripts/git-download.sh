#!/bin/bash
#
# Calculate download traffic per day
#

printf -v EXTRACT_FIELDS "%s"               \
    'print if s/.*'                         \
        '"cloning":([^,]+).*'               \
        '"program":"upload-pack".*'         \
        '"repo_name":"([^"]+).*'            \
        '"uploaded_bytes":([^,]+).*'        \
        '"user_login":"([^"]+).*'           \
    '/\2\t\4\t\1\t\3/'

echo -e "repository\tuser\tcloning?\trequests\tdownload [B]"

zcat -f /var/log/github-audit.log.1* |
    perl -ne "$EXTRACT_FIELDS" |
    sort |
    perl -ne '$S{$1} += $2 and $C{$1} += 1 if (/^(.+)\t(\d+)$/);END{printf("%s\t%i\t%i\n",$_,$C{$_},$S{$_}) for ( keys %S );}' |
    sort -rn -k5,5
