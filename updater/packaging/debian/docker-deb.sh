#!/bin/bash

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker build \
	-t hubble-enterprise-debian-packager \
	${BASE_DIR}

docker run \
	-v ${BASE_DIR}/../..:/source \
	hubble-enterprise-debian-packager \
	make
