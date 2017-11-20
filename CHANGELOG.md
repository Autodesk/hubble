# Change Log

## 0.1.1 (2017-11-20)

Please adjust your `config.py` after this upgrade (see below).

### Changes

- switch to MIT license
- [`config.py`](https://github.com/Autodesk/hubble/blob/master/updater/config.py.example): `excludedEntities` in is now a list of strings

### Features

- support for GitHub Enterprise 2.11
- new chart: total number of [organizations](https://autodesk.github.io/hubble/orgs-total) and [teams](https://autodesk.github.io/hubble/teams-total) ([@toddocon](https://github.com/toddocon))
- new chart: [total number of repositories](https://autodesk.github.io/hubble/repos-total)
- new chart: [repository activity](https://autodesk.github.io/hubble/repos-activity)
- new list: [organization owners](https://autodesk.github.io/hubble/org-owners) ([@mlbright](https://github.com/mlbright))
- remove inline JavaScript from page header ([@GitHugop](https://github.com/GitHugop))
- descriptive texts next to the charts
- add stylesheet with new logo

## 0.1.0 (2017-10-05)

Initial release

### Features

- initial dashboard and updater to visualize GitHub Enterprise collaboration, usage, and health data
- initial charts:
  - user collaboration and activity
  - pull request usage
  - Git versions, requests, traffic
  - API requests
  - forks to organizations
  - tokenless authentications
