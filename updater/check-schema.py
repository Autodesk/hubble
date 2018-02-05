#!/usr/bin/env python3

import sys

from schema import *

if __name__ == "__main__":
	# Prepare the data directory for writing the new data
	dataDirectory = locateDataDirectory()
	prepareDataDirectory(dataDirectory, fetchChanges = not configuration["dryRun"])

	# Verify schema version for forward compatibility
	checkSchemaVersion(dataDirectory)

	print("info: the data repository scheme is up-to-date", file = sys.stderr)
