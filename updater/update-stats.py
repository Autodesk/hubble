#!/usr/bin/env python3

import os
import shutil
import sys

from config import *

from reports.ReportAPIRequests import *
from reports.ReportContributorsByOrg import *
from reports.ReportContributorsByRepo import *
from reports.ReportForksToOrgs import *
from reports.ReportGitDownload import *
from reports.ReportGitRequests import *
from reports.ReportGitVersions import *
from reports.ReportOrgCollaboration import *
from reports.ReportPRByOrg import *
from reports.ReportPRByRepo import *
from reports.ReportPRHistory import *
from reports.ReportPRUsage import *
from reports.ReportTokenlessAuth import *
from reports.ReportUsers import *

def writeMetaStats(metaStats, dataDirectory):
	outputFilePath = os.path.join(dataDirectory, "meta-runtimes.tsv")

	with open(outputFilePath, "w") as outputFile:
		outputFile.write("data\truntime [s]\n")

		for entry in metaStats["runtimes"]:
			print(*entry, sep="\t", file = outputFile)

def main():
	metaStats = {"runtimes": []}

	if len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
		configuration["dryRun"] = True

	print("Preparing update of GitHub usage statistics", file = sys.stderr)
	sys.stderr.flush()

	localRepositoryName = "hubble-data"
	tmpDirectory = configuration["tmpDirectory"]
	dataDirectory = os.path.join(tmpDirectory, localRepositoryName)

	# Create data directory if not existing
	if not os.path.exists(dataDirectory):
		os.makedirs(dataDirectory)

	# Commit changes
	if not configuration["dryRun"]:
		# Clone data repository if necessary
		if not os.path.exists(os.path.join(dataDirectory, ".git")):
			executeCommand(["git", "clone", configuration["repositoryURL"], "."], cwd = dataDirectory)
		else:
			executeCommand(["git", "fetch"], cwd = dataDirectory)
			executeCommand(["git", "reset", "--hard", "origin/master"], cwd = dataDirectory)

	configuration["today"] = datetime.date.today()

	# Update reports
	ReportAPIRequests(configuration, dataDirectory, metaStats).update()
	ReportContributorsByOrg(configuration, dataDirectory, metaStats).update()
	ReportContributorsByRepo(configuration, dataDirectory, metaStats).update()
	ReportForksToOrgs(configuration, dataDirectory, metaStats).update()
	ReportGitDownload(configuration, dataDirectory, metaStats).update()
	ReportGitRequests(configuration, dataDirectory, metaStats).update()
	ReportGitVersions(configuration, dataDirectory, metaStats).update()
	ReportOrgCollaboration(configuration, dataDirectory, metaStats).update()
	ReportPRByOrg(configuration, dataDirectory, metaStats).update()
	ReportPRByRepo(configuration, dataDirectory, metaStats).update()
	ReportPRHistory(configuration, dataDirectory, metaStats).update()
	ReportPRUsage(configuration, dataDirectory, metaStats).update()
	ReportTokenlessAuth(configuration, dataDirectory, metaStats).update()
	ReportUsers(configuration, dataDirectory, metaStats).update()

	# Write meta statistics
	writeMetaStats(metaStats, dataDirectory)

	# Commit changes
	if not configuration["dryRun"]:
		executeCommand(["git", "config", "user.name", configuration["userName"]], cwd = dataDirectory)
		executeCommand(["git", "config", "user.email", configuration["userEMail"]], cwd = dataDirectory)
		executeCommand(["git", "add", "."], cwd = dataDirectory)
		executeCommand(["git", "commit", "--allow-empty", "-mUpdated GitHub usage statistics"], cwd = dataDirectory)
		executeCommand(["git", "push"], cwd = dataDirectory)

	print("Finished update of GitHub usage statistics", file = sys.stderr)
	sys.stderr.flush()

main()
