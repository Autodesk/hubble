import csv
import os
import sys

from config import *
from helpers import *

schemaVersion = 1

# Check the data repository's schema version and fail if it's outdated
# Assumes that the data directory is already initialized and up-to-date
def checkSchemaVersion(dataDirectory):
	schemaVersionLocal = 0

	try:
		metaFilePath = os.path.join(dataDirectory, "meta.tsv")

		# If no meta.tsv has been created yet, no schema compatibility check is necessary
		if not os.path.exists(metaFilePath):
			return

		with open(metaFilePath, "r") as tsvFile:
			tsvReader = csv.reader(tsvFile, delimiter = "\t")

			for row in tsvReader:
				if row[0] == "schema-version":
					schemaVersionLocal = int(row[1])
					break
	except:
		pass

	if schemaVersionLocal < schemaVersion:
		print("error: the data repository has an outdated scheme and needs to be migrated", file = sys.stderr)
		sys.exit(1)
