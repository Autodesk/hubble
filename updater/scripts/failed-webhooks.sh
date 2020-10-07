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
  jq --slurp '.[] | {id: .id, url: .url, type: (.data|tostring|fromjson)[0], msg: .msg}' |
  jq --slurp -c '.[] | [.id,.url,.type,.msg]' |
  sort |
  uniq -ic |
  sort -rn |
  awk -F [ '{printf("%s,%s\n", $2,$1)}' |
  awk -F, '{
    gsub(/(\[|\]|\")/, "");
    gsub(/-[0-9]+/, "", $3);
    gsub(/ /, "", $5);
    printf("%s\t%s\t%s\t%s\t%s\n",$1,$3,$2,$4,$5)
  }'
