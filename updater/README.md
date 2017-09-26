## Hubble Enterprise Updater

The updater can run in one of two modes:
1. As a [service on a dedicated machine](README.md#service-on-a-dedicated-machine) that calls the GitHub Enterprise appliance.
	* Pro: No modification to the GitHub Enterprise image necessary.
	* Con: Requires an additional machine and [administrative shell access](https://help.github.com/enterprise/2.11/admin/guides/installation/administrative-shell-ssh-access/).
1. As a [service on the GitHub Enterprise appliance](README.md#service-on-the-github-enterprise-appliance).  
	* Pro: Quick and easy setup. No additional machine required.  
	* Con: Requires modifications to the GitHub Enterprise image.


### Setup on a dedicated machine

1. Setup a Linux or macOS machine. 
1. Ensure that Git and Python3 are installed (e.g. on macOS via [homebrew](https://brew.sh/) with `brew update && brew install python3`).
1. Clone this repository to your machine.
1. Create a config file in `updater/config.py` in your local clone (based on [`updater/config.py.example`](config.py.example))
1. Configure a service or cron job that executes `python3 update-stats.py` once per day. 


### Setup on the GitHub Enterprise appliance

#### Installation
1. Download the [latest release](https://github.com/Autodesk/hubble/releases/latest) from GitHub.
1. Check the SHA512 hash of the downloaded package against the value of  [latest page](https://github.com/autodeks/hubble/releases/latest):
	```sh
	sha512sum hubble-enterprise_x.y.z_all.deb
	```
1. Install the package:
	```sh
	sudo dpkg -i hubble-enterprise_x.y.z_all.deb
	```
1. Create a config file in `/opt/autodesk/hubble-enterprise/config.py` (based on `[config.py.example](config.py.example)`).
1. Enable and start the **periodic** updater process (persistently, survives reboots):
	```sh
	systemctl --user enable hubble-enterprise.timer
	systemctl --user start hubble-enterprise.timer
	```
1. Optionally, you may **trigger** the updater process (just once):
	```sh
	systemctl --user start hubble-enterprise.service
	```

#### Upgrading

1. Remove old versions of the package (if existent):
	```sh
	sudo apt-get remove hubble-enterprise
	```
1. Install the new version of the package:
	```sh
	sudo dpkg -i hubble-enterprise_x.y.z_all.deb
	```
1. If the `systemd` files (the service or timer file) have changed, let systemd adapt to the changes:
	```sh
	systemctl --user daemon-reexec
	```

#### Uninstallation

1. Remove the package:
	```sh
	sudo apt-get remove hubble-enterprise
	```
1. Disable the **periodic** updater process:
	```sh
	systemctl --user disable hubble-enterprise.timer
	```

#### Debugging

The updater’s log is accessible as follows:
```sh
journalctl -f --user-unit hubble-enterprise.service
```

#### Debian Packaging

See the [documentation](packaging/debian) for more instructions.

