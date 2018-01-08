PKGVERSION = $(shell cat ../../version)
PKGNAME = hubble-enterprise
BUILDTOPDIR = build
BUILDDIR = $(BUILDTOPDIR)/$(PKGNAME)-$(PKGVERSION)
PKGDIR = package
MAINTAINER = "Patrick Lühne"
EMAIL = "patrick.luehne@autodesk.com"

all:	clean
	mkdir -p $(BUILDDIR)
	cp templates/Makefile $(BUILDDIR)/
	cd $(BUILDDIR) && \
	export DEBEMAIL=$(EMAIL) && \
	export DEBFULLNAME=$(MAINTAINER) && \
	python /usr/bin/dh_make -p $(PKGNAME)_$(PKGVERSION) -i --native -c mit -y && \
	dpkg-buildpackage -rfakeroot -d -us -uc
	mkdir -p $(PKGDIR)
	mv $(BUILDDIR)/../*.deb $(PKGDIR)/
	rm -rf $(BUILDTOPDIR)

clean:
	rm -rf $(BUILDTOPDIR)
