# Debian Packaging

There are two ways to package the GitHub stats updater for Debian—manually or with help of Docker.

If you are familiar with Linux distributions and package managers, you might prefer to manually build the `deb` package. If you’re on a different platform, Docker might be more convenient.

## Manual Packaging

If you want to locally build the Debian package, you’ll need the following dependencies: `dh_make`, `dpkg-buildpackage`, `fakeroot`, and `python2`. These packages might be named different depending on your platform.

After installing the dependencies, run

```shell
make
```

and the `deb` package will be created in the `package` directory.

## Packaging with Docker

First, you’ll need to install `docker` and start the Docker service. Note that you have to be either the `root` user or in the `docker` group in order to execute Docker commands.

Then, create the `deb` package:

```shell
./docker-deb.sh
```

This script will create a Debian image called `hubble-enterprise-debian-packager` with all the required dependencies.
Then it will run the Debian packaging tools inside the Docker container.
The result will be the `deb` package in the `package` directory.
