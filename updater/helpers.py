import datetime
import os
import subprocess
import sys

import http.client
import json
import ssl

from config import *

# Simple class to get floating-point values printed prettily
class PrettyFloat(float):
	def __str__(self):
		return "%0.3f" % self

# Executes a single command and returns stdout and stderr
def executeCommand(command, stdin = None, cwd = None):
	with subprocess.Popen(command, stdout = subprocess.PIPE, stderr = subprocess.PIPE, stdin = (subprocess.PIPE if stdin != None else None), cwd = cwd) as process:
		stdout, stderr = process.communicate(input = (stdin.encode("utf-8") if stdin != None else None))

		print(stderr.decode("utf-8"), file = sys.stderr)
		sys.stderr.flush()

		if process.returncode != 0:
			raise RuntimeError(command[0] + " failed with exit code " + str(process.returncode))

		return stdout, stderr

# Convenience function to parse a date from a string
def parseDate(string):
	return datetime.datetime.strptime(string, "%Y-%m-%d").date()

# The location of the local working copy of the data repository
def locateDataDirectory():
	tmpDirectory = configuration["tmpDirectory"]
	return os.path.join(tmpDirectory, "hubble-data")

# Create a local clone of the data repository if not present and update it
def prepareDataDirectory(dataDirectory, fetchChanges = True):
	# Create data directory if not existing
	if not os.path.exists(dataDirectory):
		os.makedirs(dataDirectory)

	# Get the data directory up-to-date
	if fetchChanges:
		# Clone data repository if necessary
		if not os.path.exists(os.path.join(dataDirectory, ".git")):
			print("git clone", configuration["repositoryURL"])
			executeCommand(["git", "clone", configuration["repositoryURL"], "."], cwd = dataDirectory)
		else:
			executeCommand(["git", "fetch"], cwd = dataDirectory)
			executeCommand(["git", "reset", "--hard", "origin/master"], cwd = dataDirectory)

def getMaintenanceStatus():
	"""Poll https://$gheHost/setup/api/maintenance to get state of maintenance-mode"""
	if configuration['remoteRun']['enabled'] == True:
		try:
			if len(configuration['remoteRun']['consolePassword']) > 0:
				consolePassword = configuration['remoteRun']['consolePassword']

				maintUrl = '/setup/api/maintenance?api_key=' + consolePassword

				conn = http.client.HTTPSConnection(     configuration['remoteRun']['gheHost'],
									8443,
									context = ssl._create_unverified_context()
								  )

				conn.request("GET", maintUrl)

				res = conn.getresponse()
				data = res.read()

				gheStatus = json.loads(data.decode("utf-8"))

				return(gheStatus['status'])

		except Exception as e:
			return("unknown")
