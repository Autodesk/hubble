#!/bin/bash
#
# Lists which git version was used by how many users yesterday
#
echo -e "Git version\tusers"

zcat -f /var/log/github-audit.log.1* |
	perl -ne 'print if s/.*agent=git\/(\d+(?:\.\d+){0,2}).*"user_id":(\d+).*/\2\t\1/' |
	sort |
	uniq |
	perl -lape 's/\d+ *//' |
	sort -r -V |
	uniq -ic |
	awk '{printf("%s\t%s\n",$2,$1)}'
