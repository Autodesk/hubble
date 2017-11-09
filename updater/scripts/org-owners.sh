#!/bin/bash
#
# Get the owners for each org. Exclude site admins and suspended users.
#
echo -e "organization\towner"

github-env bin/runner -e production "'
    User.where(:type => \"Organization\").each do |o|
        o.admins.where(:disabled => false, :gh_role => nil).each do |m|
            puts \"#{o.login}\\t#{m.name}\\n\"
        end
    end
'"
