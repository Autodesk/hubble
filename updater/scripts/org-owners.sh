#!/bin/bash
#
# Get the owners for each org. Exclude site admins and suspended users.
#
echo -e "organization\towners"

github-env bin/runner -e production "'
	User.where(:type => \"Organization\").each do |o|
		owners = o.admins.where(:disabled => false, :gh_role => nil).join(\",\")
		puts \"#{o.login}\\t#{owners}\\n\"
	end
'"
