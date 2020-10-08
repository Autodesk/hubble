#!/bin/bash

#
# List failed webhooks
#

echo -e "hook_id\ttype\thost\tmessage\tcount"

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
