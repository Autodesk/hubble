[![Logo Banner](logo-banner.svg)](https://autodesk.github.io/hubble/)

# Hubble Enterprise [![GitHub Release](https://img.shields.io/github/release/autodesk/hubble.svg?maxAge=3600)](https://github.com/autodesk/hubble/releases)

_Hubble Enterprise_ visualizes [GitHub Enterprise](https://enterprise.github.com) collaboration, usage, and health data.

Explore our [interactive demo](https://autodesk.github.io/hubble/) to learn more!

> :warning: **Attention:**
> Hubble Enterprise is not supported by or affiliated with GitHub.
> Use it at your own risk! Autodesk assumes no responsibility for any data loss or hardship incurred directly or indirectly by using Hubble Enterprise.
>
> Hubble Enterprise runs all queries through the [GitHub Enterprise administrative shell](https://help.github.com/enterprise/2.11/admin/guides/installation/administrative-shell-ssh-access/) and ignores repository visibility settings to generate statistics over all repositories on your appliance.
> Consequently, the names (no content!) of private repositories could show up on the Hubble dashboard published via GitHub Pages on your appliance.
> If you have enabled [Public Pages](https://help.github.com/enterprise/2.10/admin/guides/installation/configuring-github-enterprise-pages/#setting-github-enterprise-pages-to-be-publicly-accessible) on your GitHub Enterprise management console, then everyone on your network will be able to see the Hubble dashboard!
>
> Please use Hubble Enterprise on your production instance only after reviewing the source code carefully!

## Getting Started

Hubble Enterprise consists of two components.
The **updater** component queries relevant data from a GitHub Enterprise appliance and stores the results in a Git repository once a day.
The **docs** component visualizes the collected data with [GitHub Pages](https://pages.github.com/).

1. Create a new, initialized, public repository for Hubble’s data on your GitHub Enterprise appliance (for instance, `https://git.company.com/scm/hubble-data`).
1. Publish Hubble’s [data repository on GitHub Pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages).
   Go to the repository settings, *options* tab, *GitHub Pages* section, then choose *master branch* as *source*, and click *save*.
   GitHub Enterprise will now tell you the URL of the published data pages (for instance, `https://pages.git.company.com/scm/hubble-data` if you have [subdomain isolation enabled](https://help.github.com/enterprise/2.1/admin/articles/configuring-dns-ssl-and-subdomain-settings/#enabling-subdomain-isolation)).
   Please be aware that this is a *GitHub Pages URL* and not just the repository’s URL.
   Note this URL down as `dataURL`, as you will need it later.
1. Create a new, uninitialized, public repository for Hubble on your GitHub Enterprise appliance (for instance, `https://git.company.com/scm/hubble`).
1. Clone [this repository](https://github.com/autodesk/hubble) to your local machine, add your new Hubble repository as a remote, and push Hubble’s *master* branch to this remote:
   ```sh
   git clone https://github.com/autodesk/hubble
   cd hubble
   git remote add ghe https://git.company.com/scm/hubble
   git push -u ghe master
   ```
1. Open [`docs/_config.yml`](docs/_config.yml) in your editor and set the `dataURL` that you noted earlier.
   Commit and push the change to your Hubble repository.
1. Publish Hubble’s [docs component on GitHub Pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).
   Go to the repository settings, *options* tab, *GitHub Pages* section, then choose *master branch/docs folder* as *source*, and click *save*.
   GitHub Enterprise will now tell the URL of the published dashboard pages.
   You may want to bookmark this URL to conveniently access the dashboard of Hubble Enterprise.
1. [Configure the updater component](updater/README.md).

## Contributing

Review [the contributing guidelines](CONTRIBUTING.md) before you consider working on Hubble Enterprise and proposing contributions.

## Core Team

These are the humans that form the core team of Hubble Enterprise, in alphabetical order:

| [![](https://avatars3.githubusercontent.com/u/477434?v=4&s=100)](https://github.com/larsxschneider)<br><sub>[@larsxschneider](https://github.com/larsxschneider)</sub> | [![](https://avatars1.githubusercontent.com/u/3244280?v=4&s=100)](https://github.com/pluehne)<br><sub>[@pluehne](https://github.com/pluehne)</sub> |
|---|---|

## License

SPDX-License-Identifier: [MIT](LICENSE.md)
