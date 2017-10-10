#!/bin/bash
#
# Calculate download traffic per day
#
echo -e "repository\tuser\tcloning?\trequests/day\tdownload/day [B]"

zcat -f /var/log/github/audit.log.1* |
    perl -ne 'print if s/.*"program":"upload-pack".*"repo_name":"([^"]+).*"user_login":"([^"]+).*"cloning":([^,]+).*"uploaded_bytes":([^ ]+).*/\1\t\2\t\3\t\4/' |
    sort |
    perl -ne '$S{$1} += $2 and $C{$1} += 1 if (/^(.+)\t(\d+)$/);END{printf("%s\t%i\t%i\n",$_,$C{$_},$S{$_}) for ( keys %S );}' |
    sort -rn -k5,5
