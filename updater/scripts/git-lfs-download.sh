#!/bin/bash
#
# Calculate Git LFS traffic per day in bytes
#

echo "lfs traffic [B]"
zcat -f /var/log/haproxy.log.1* |
    LANG=C perl -ne '/\s200\s(\d+)\s-\s\-\s----\s.*GET (?:\/storage)?\/lfs\/\d+\// && {$traffic += $1}; END {print $traffic}'
