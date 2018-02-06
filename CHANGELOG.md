# Change Log

## (unreleased)

## 0.1.1 (2017-11-20)

Please adjust your `config.py` after this upgrade (see below).

### Changes

- switch to MIT license
- [`config.py`](https://github.com/Autodesk/hubble/blob/master/updater/config.py.example): `excludedEntities` in is now a list of strings

### Features

- support for GitHub Enterprise 2.11 ([#8](https://github.com/Autodesk/hubble/issues/8), [#11](https://github.com/Autodesk/hubble/issues/11), [#29](https://github.com/Autodesk/hubble/issues/29), [#44](https://github.com/Autodesk/hubble/issues/44), helped by [@rashamalek](https://github.com/rashamalek))
- new chart: total number of [organizations](https://autodesk.github.io/hubble/orgs-total) and [teams](https://autodesk.github.io/hubble/teams-total) ([#39](https://github.com/Autodesk/hubble/issues/39), [#43](https://github.com/Autodesk/hubble/issues/43), [@toddocon](https://github.com/toddocon))
- new chart: [repositories (total)](https://autodesk.github.io/hubble/repos-total) ([#27](https://github.com/Autodesk/hubble/issues/27))
- new chart: [repository activity](https://autodesk.github.io/hubble/repos-activity) ([#28](https://github.com/Autodesk/hubble/issues/28))
- new list: [organization owners](https://autodesk.github.io/hubble/org-owners) ([#36](https://github.com/Autodesk/hubble/issues/36), [#38](https://github.com/Autodesk/hubble/issues/38), [#40](https://github.com/Autodesk/hubble/issues/40), [@mlbright](https://github.com/mlbright))
- remove inline JavaScript from page header ([#18](https://github.com/Autodesk/hubble/issues/18), [@Swardu](https://github.com/Swardu))
- descriptive texts next to the charts
- add stylesheet with new logo ([#31](https://github.com/Autodesk/hubble/issues/31), [#32](https://github.com/Autodesk/hubble/issues/32), [#41](https://github.com/Autodesk/hubble/issues/41))

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
