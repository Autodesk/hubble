#!/bin/bash
#
# Get the owners for each org. Exclude site admins and suspended users.
#
echo -e "organization\towner"

github-env bin/runner -e production "'
    orgs=User.all.select {
        |u| u.type == \"Organization\" and not u.disabled and not u.suspended_at and u.login and u.gh_role.nil?
    }.map {
            |u|
                [u.login, u.admins]
    }.sort do |a, b|
        a[0].casecmp(b[0])
    end

    orgs.each do |org|
        org[1].each do |admin|
            puts org[0] + \"\\t\" + admin.login
        end
    end
'"
