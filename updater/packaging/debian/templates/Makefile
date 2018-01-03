all: # nothing to build

PKGNAME = hubble-enterprise
INSTALLDIR = $(DESTDIR)/opt/autodesk/$(PKGNAME)
SYSTEMDDIR = $(DESTDIR)/usr/lib/systemd/system
BASEDIR=../../../..

install:
	mkdir -p $(INSTALLDIR)
	install -m 644 $(BASEDIR)/update-stats.py $(INSTALLDIR)/
	install -m 644 $(BASEDIR)/config.py.example $(INSTALLDIR)/
	install -dm 755 $(BASEDIR)/scripts $(INSTALLDIR)/scripts
	find $(BASEDIR)/scripts/*.sh -type f | xargs install -m 755 -t $(INSTALLDIR)/scripts
	install -dm 755 $(BASEDIR)/reports $(INSTALLDIR)/reports
	find $(BASEDIR)/reports/*.py -type f | xargs install -m 644 -t $(INSTALLDIR)/reports
	mkdir -p $(SYSTEMDDIR)
	install -m 644 $(BASEDIR)/systemd/* $(SYSTEMDDIR)/
