#!/bin/bash

git_versions_file=$1

if [[ -z $git_versions_file ]]
then
	echo "Usage: update-git-versions.json.sh <git-versions.json file> [--in-place]"
	exit 1
fi

# Clone a fresh repository
if [[ ! -d git ]]
then
	git clone https://github.com/git/git --quiet
else
	git -C git fetch --quiet
	git -C git reset --hard origin/master --quiet
fi

# “taggerdate:iso-local” forces an ISO timestamp in the local time zone,
# which we override with UTC in order to reliably extract timestamps.
# “refname:short” displays tags as “v1.2.3” and not “refs/tags/v1.2.3”.
# Versions earlier than 2 are excluded, because they are outdated
# anyway by now. Release candidates are also removed.
TZ=UTC git -C git tag -l 'v*' --format='%(refname:short)	%(taggerdate:iso-local)' --sort=-taggerdate \
	| grep -v '^v[01]' \
	| grep -v 'rc' \
	| perl -pe 's/(\d{4,}-\d{2,}-\d{2,}) \d{2,}:\d{2,}:\d{2,} \+0000/\1/g' \
	| cut -c 2- \
	> git-releases.tsv

# Translate the TSV file to JSON.
jq --slurp --raw-input --raw-output --tab \
	'split("\n")
	| .[:-1]
	| map(split("\t"))
	| map({"key": .[0], "value": {"publishedOn": .[1]}})
	| from_entries' \
	git-releases.tsv > git-releases.json

# Replace the Git releases list in the top-level JSON with the fresh
# release array generated above
jq --slurp --raw-output --tab \
	'.[0]."gitVersions".releases = .[1] | .[0]' \
	"$git_versions_file" git-releases.json \
	> git-releases.new.json

if [[ $* == *--in-place* ]]
then
	mv git-releases.new.json "$git_versions_file"
else
	less git-releases.new.json
fi
