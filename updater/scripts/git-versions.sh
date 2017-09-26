#!/bin/bash
#
# Lists which git version was used by how many users yesterday
#
echo -e "git version\tcount"

zgrep -hF '||git/' /var/log/haproxy.log.1* |
	perl -lape 's/.* (.*):.* \[.*\|\|git\/(\d+(?:\.\d+){0,2}).*/$1 $2/' |
	sort |
	uniq |
	perl -lape 's/[^ ]+ //' |
	sort -r -V |
	uniq -c |
	awk '{printf("%s\t%s\n",$2,$1)}'
