# Change Log

## 0.3.0 (2018-04-30)

### Changes

* switch [user activity chart](https://autodesk.github.io/hubble/users-activity) from 1-month to 4-week intervals ([#129](https://github.com/Autodesk/hubble/issues/129), [#135](https://github.com/Autodesk/hubble/issues/135))

### Features

* new chart: [list of most active repositories](https://autodesk.github.io/hubble/repos-activity) ([#119](https://github.com/Autodesk/hubble/issues/119), [#123](https://github.com/Autodesk/hubble/issues/123), [@mlbright](https://github.com/mlbright))
* new chart: [API requests per user](https://autodesk.github.io/hubble/housekeeping-api-requests) ([#148](https://github.com/Autodesk/hubble/issues/148), [@dfarr](https://github.com/dfarr))
* add 2-month, 2-year, and *all data* views to all charts of *history* type ([#126](https://github.com/Autodesk/hubble/issues/126), [#154](https://github.com/Autodesk/hubble/issues/154))
* add 2-week, 2-month, and 2-year views to [collaboration chart](https://autodesk.github.io/hubble/) ([#115](https://github.com/Autodesk/hubble/issues/115), [#124](https://github.com/Autodesk/hubble/issues/124))
* show the time range and aggregation method in tooltips when hovering aggregated data ([#130](https://github.com/Autodesk/hubble/issues/130), [#143](https://github.com/Autodesk/hubble/issues/143))
* add detailed Git versions report (not visualized yet, [#144](https://github.com/Autodesk/hubble/issues/144))

### Bug Fixes

* fix issue where data wasn’t aggregated with single-view charts ([#120](https://github.com/Autodesk/hubble/issues/120), [#121](https://github.com/Autodesk/hubble/issues/121))
* fix unintended scrolling to the top of the page when switching chart views ([#125](https://github.com/Autodesk/hubble/issues/125))
* fix JavaScript error with empty chart views ([#128](https://github.com/Autodesk/hubble/issues/128), [#134](https://github.com/Autodesk/hubble/issues/134))
* update data file headers on every update ([#138](https://github.com/Autodesk/hubble/issues/138), [#139](https://github.com/Autodesk/hubble/issues/139), reported by [@talktopiyush](https://github.com/talktopiyush) and [@rajivmucheli](https://github.com/rajivmucheli))
* fix [tokenless authentication chart](https://autodesk.github.io/hubble/recommendations-tokenless-auth) on GitHub Enterprise 2.12 ([#139](https://github.com/Autodesk/hubble/issues/139), [#141](https://github.com/Autodesk/hubble/issues/141), reported by [@talktopiyush](https://github.com/talktopiyush) and [@rajivmucheli](https://github.com/rajivmucheli))
* fix error with forward compatibility check when the data repository is empty ([#145](https://github.com/Autodesk/hubble/issues/145), [#146](https://github.com/Autodesk/hubble/issues/146), [#153](https://github.com/Autodesk/hubble/issues/153), [@IngoS11](https://github.com/IngoS11), reported by [@IngoS11](https://github.com/IngoS11) and [@sky9723](https://github.com/sky9723))
* fix Python error because of missing module import ([#136](https://github.com/Autodesk/hubble/issues/136), [#146](https://github.com/Autodesk/hubble/issues/146), [#152](https://github.com/Autodesk/hubble/issues/152), [@IngoS11](https://github.com/IngoS11), reported by [@primetheus](https://github.com/primetheus), [@IngoS11](https://github.com/IngoS11), and [@sky9723](https://github.com/sky9723))
* fix incorrect dates shown at the end of date ranges ([#118](https://github.com/Autodesk/hubble/issues/118), [#147](https://github.com/Autodesk/hubble/issues/147), [#149](https://github.com/Autodesk/hubble/issues/149), reported by [@toddocon](https://github.com/toddocon))

### Infrastructure

* support for extending Hubble with custom chart types by making the types handled by Hubble explicit ([#150](https://github.com/Autodesk/hubble/issues/150))

## 0.2.0 (2018-02-06)

This update turns the `systemd` updater service into a system service (see below).
If Hubble runs [on your GitHub Enterprise appliance](https://github.com/Autodesk/hubble/tree/master/updater#setup-on-the-github-enterprise-appliance) and not on a [dedicated machine](https://github.com/Autodesk/hubble/tree/master/updater#setup-on-a-dedicated-machine), please perform the following steps after the update:

```sh
systemctl --user stop hubble-enterprise.timer
systemctl --user disable hubble-enterprise.timer
sudo systemctl enable hubble-enterprise.timer
sudo systemctl start hubble-enterprise.timer
```

### Changes

- switch updater from a `systemd` user service to a system service for higher reliability ([#72](https://github.com/Autodesk/hubble/issues/72))

### Features

- new chart: [organization activity](https://autodesk.github.io/hubble/orgs-activity) ([#94](https://github.com/Autodesk/hubble/issues/94))
- new chart: [abandoned organizations](https://autodesk.github.io/hubble/housekeeping-abandoned-orgs) ([#95](https://github.com/Autodesk/hubble/issues/95))
- new chart: [personal repositories with nonowner pushes](https://autodesk.github.io/hubble/housekeeping-repo-location) ([#96](https://github.com/Autodesk/hubble/issues/96))
- new chart: [legacy admin teams](https://autodesk.github.io/hubble/recommendations-legacy-teams) ([#104](https://github.com/Autodesk/hubble/issues/104))
- new chart: [repository feature usage](https://autodesk.github.io/hubble/repos-feature-usage) ([#112](https://github.com/Autodesk/hubble/issues/112))
- spinner animation while charts are loading ([#59](https://github.com/Autodesk/hubble/issues/59), [#63](https://github.com/Autodesk/hubble/issues/63), [@filmaj](https://github.com/filmaj))
- action bar with button to download the raw data files next to the charts ([#85](https://github.com/Autodesk/hubble/issues/85), [#92](https://github.com/Autodesk/hubble/issues/92), [#97](https://github.com/Autodesk/hubble/issues/97))
- [multiview charts](https://autodesk.github.io/hubble/pr-total) providing multiple levels of granularity with a view switcher ([#77](https://github.com/Autodesk/hubble/issues/77))

### Bug Fixes

- fix links to user names containing underscores or periods in the *tokenless authentications* report ([#53](https://github.com/Autodesk/hubble/issues/53))
- fix parsing issues with colons in *API requests* report ([#49](https://github.com/Autodesk/hubble/issues/49), reported by [@jonico](https://github.com/jonico))
- fix issues with the *Git traffic* report in GitHub Enterprise 2.11.0–2.11.6 ([#8](https://github.com/Autodesk/hubble/issues/8), [#46](https://github.com/Autodesk/hubble/issues/46), reported by [@rashamalek](https://github.com/rashamalek))
- fix issues with the *Git traffic* report in GitHub Enterprise 2.12 because of reordered fields ([#107](https://github.com/Autodesk/hubble/issues/107), [@rashamalek](https://github.com/rashamalek))
- fix issue with non-ASCII characters in the updater ([#79](https://github.com/Autodesk/hubble/issues/79), reported by [@rajivmucheli](https://github.com/rajivmucheli))
- flush the browser cache of the CSS and JavaScript assets on every commit ([#93](https://github.com/Autodesk/hubble/issues/93), helped by [@parkr](https://github.com/parkr))
- remove internal GitHub API requests from *API requests* report ([#101](https://github.com/Autodesk/hubble/issues/101))
- remove suspended users from *organization owners* list ([#100](https://github.com/Autodesk/hubble/issues/100))
- fix unintentionally truncated texts in tables with commas and space characters

### Infrastructure

- unit testing and linting with Travis CI for the dashboard ([#65](https://github.com/Autodesk/hubble/issues/65), [#78](https://github.com/Autodesk/hubble/issues/78), [@filmaj](https://github.com/filmaj))
- code coverage with CodeCov for the dashboard ([#84](https://github.com/Autodesk/hubble/issues/84), [@filmaj](https://github.com/filmaj))
- make Debian packaging compatible with Python 3 ([#73](https://github.com/Autodesk/hubble/issues/73))
- forward compatibility check for future data repository scheme changes ([#111](https://github.com/Autodesk/hubble/issues/111))

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
- new chart: [organization owners](https://autodesk.github.io/hubble/org-owners) ([#36](https://github.com/Autodesk/hubble/issues/36), [#38](https://github.com/Autodesk/hubble/issues/38), [#40](https://github.com/Autodesk/hubble/issues/40), [@mlbright](https://github.com/mlbright))
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
