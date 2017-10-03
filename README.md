# Hubble Enterprise

_Hubble Enterprise_ visualizes [GitHub Enterprise](https://enterprise.github.com) usage and health data. Explore our [interactive demo](https://autodesk.github.io/hubble/index.html) to learn more!

> :warning: **Attention**: Hubble Enterprise is not supported by or affiliated with GitHub. Use it at your own risk! Autodesk assumes no responsibility for any data loss or hardship incurred directly or indirectly by using Hubble Enterprise.
>
> Hubble Enterprise runs all queries through the [GitHub Enterprise administrative shell](https://help.github.com/enterprise/2.11/admin/guides/installation/administrative-shell-ssh-access/) and ignores repository visibility settings to generate statistics over all repositories on your appliance. Consequently, the names (no content!) of private repositories could show up on the Hubble dashboard published via GitHub Pages on your appliance. If you have enabled [Public Pages](https://help.github.com/enterprise/2.10/admin/guides/installation/configuring-github-enterprise-pages/#setting-github-enterprise-pages-to-be-publicly-accessible) on your GitHub Enterprise management console, then everyone on your network would be able to see the Hubble dashboard!
>
> Please use Hubble Enterprise on your production instance only after careful review of the source code!


## Getting Started

Hubble Enterprise consists of two components. The **updater component** runs once a day; queries relevant data from a GitHub Enterprise appliance and stores the results in a Git repository. The **docs component** uses [GitHub Pages](https://pages.github.com/) to visualize the collected data on the GitHub Enterprise appliance.

1. Create a new, initialized, public repository for Hubble data on your GitHub Enterprise appliance (e.g. https://git.company.com/scm/hubble-data).
1. Publish the Hubble data repository on [GitHub Pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages). Go to repository Settings, Option Tab, GitHub Pages section, choose Source "master branch", and click "Save". GitHub Enterprise will tell you a publish URL. Note that down as _dataURL_. We need it in a second.
1. Create a new, uninitialized, public repository for Hubble on your GitHub Enterprise appliance (e.g. to https://git.company.com/scm/hubble).
1. Clone [this repository](https://github.com/autodesk/hubble) to your local machine, add your new Hubble repository as remote, and push the Hubble _master_ branch to this remote: 
    ```sh
    git clone https://github.com/autodesk/hubble
    cd hubble
    git remote add ghe https://git.company.com/scm/hubble
    git push -u ghe master
    ``` 
1. Open [docs/_config.yml](docs/_config.yml) in your editor and set the _dataURL_ that we generated earlier. Commit and push the change to your Hubble repository. 
1. Publish the [docs component on GitHub Pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch). Go to repository Settings, Option Tab, GitHub Pages section, choose Source "master branch /docs folder", and click "Save". GitHub Enterprise will tell you a publish URL. Save this URL to your bookmark. This will be the link the to access Hubble Enterprise.
1. Configure the [updater component](updater/README.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for info on working on Hubble Enterprise and sending patches.

## Core Team

These are the humans that form the Hubble Enterprise core team, which runs the project. In alphabetical order:

| [@larsxschneider](https://github.com/larsxschneider/) | [@pluehne](https://github.com/pluehne) |
|---|---|
| [![](https://avatars3.githubusercontent.com/u/477434?v=4&s=100)](https://github.com/larsxschneider) | [![](https://avatars1.githubusercontent.com/u/3244280?v=4&s=100)](https://github.com/pluehne) |

## License
[Apache License 2.0](LICENSE)
