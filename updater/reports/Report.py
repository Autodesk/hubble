import csv
import datetime
import io
import os
import sys
import time

from helpers import *

# Abstract base class for all reports that automates reading and writing reports etc.
class Report(object):
	def __init__(self, configuration, dataDirectory, metaStats):
		self.configuration = configuration
		self.dataDirectory = dataDirectory
		self.metaStats = metaStats
		self.header = None
		self.data = []
		self.detailedHeader = None
		self.detailedData = None

	# Name of the report, must be overridden in subclasses
	def name(self):
		return "unnamed-report"

	# Determines the output filename of the report
	def fileName(self):
		return os.path.join(self.dataDirectory, self.name() + ".tsv")

	def detailedFileName(self):
		return os.path.join(self.dataDirectory, self.name() + "-detailed.tsv")

	# Convenience function to return the date n days ago
	def daysAgo(self, days):
		return self.configuration["today"] - datetime.timedelta(days)

	# Convenience function to return the date of yesterday
	def yesterday(self):
		return self.daysAgo(1)

	# The maximum time range for all metrics consisting of the last full
	# 105 weeks (~ 2 years) starting with a Monday.
	# Start and end of the time range are inclusive
	def timeRangeTotal(self):
		twoYearsAgo = self.yesterday() - datetime.timedelta(weeks = 105)

		# Always start with a Monday
		twoYearsAgo -= datetime.timedelta(twoYearsAgo.weekday())

		return [twoYearsAgo, self.yesterday()]

	def scriptPath(self, script):
		return os.path.join(
			os.path.dirname(os.path.realpath(__file__)),
			"..",
			"scripts",
			script
		)

	# Executes a script but prints stderr and returns stdout only.
	# A script is either a path to a file or a list of strings with bash
	# commands.
	# In case of a remote run (IOW: scripts run via SSH), the script is
	# executed by passing its content via stdin to `bash -s --`. This
	# method only works if the script has no stdin not set already.
	def executeScript(self, script, stdin = None):
		if self.configuration["remoteRun"]["enabled"]:
			if not stdin:
				try:
					# If the script is a file, then read its content as-is into stdin
					with open(self.scriptPath(script)) as f:
						stdin = f.read()
				except:
					# If the script is a list of strings, then escape the content and set it to stdin
					stdin = " ".join(map(lambda x: '"' + x.replace('\\"', '\\\\"').replace('"', '\\"') + '"', script))
				script = ["bash", "-s", "--"]

			# Execute the script via SSH
			script = [
					"ssh",
					"-i", self.configuration["remoteRun"]["sshKey"],
					"-p", "122",
					"admin@" + self.configuration["remoteRun"]["gheHost"]
				] + script

		stdout, stderr = executeCommand(script, stdin)

		print(stderr.decode("utf-8"), file = sys.stderr)
		sys.stderr.flush()

		return stdout

	def executeRubyScriptOnServer(self, script):
		# Escape the Ruby script, as it is going to be sent as a string on the command line
		script = script.replace('\\t', '\\\\t').replace('\\n', '\\\\n')

		command = ["github-env", "bin/runner", "-e", "production", "'" + script + "'"]

		return self.executeScript(command)

	# Executes a database query, given as a string
	def executeDatabaseQueryOnServer(self, query):
		return self.executeScript(self.configuration["databaseCommand"], stdin = query)

	# Helper function to parse a TSV file into a data array
	def readTSVData(self, tsvReader):
		header = None
		data = []
		for row in tsvReader:
			if header == None:
				header = row
				continue
			data.append(row)
		return (header, data)

	# Reads an existing report into the data member variable
	def readData(self):
		fileName = self.fileName()

		if not os.path.exists(fileName):
			return

		with open(fileName, "r") as tsvFile:
			self.header, self.data = self.readTSVData(csv.reader(tsvFile, delimiter = "\t"))

	# Parses a byte string with TSV data into a data array
	def parseData(self, stream):
		streamIO = io.StringIO(stream.decode("utf-8"))
		return self.readTSVData(csv.reader(streamIO, delimiter = "\t"))

	# Sort the data by date
	def sortData(self, key, reverse = False):
		self.data.sort(key = lambda row: row[key], reverse = reverse)

	def writeDataInternal(self, fileName, header, data):
		print(fileName)
		with open(fileName, "w") as tsvFile:
			writer = csv.writer(tsvFile, delimiter = "\t", lineterminator = "\n")
			if header != None:
				writer.writerow(header)
			writer.writerows(data)

		if self.configuration["dryRun"]:
			print("==== " + fileName + " " + "=" * (80 - 6 - len(fileName)), file = sys.stderr)

			with open(fileName, "r") as tsvFile:
				print(tsvFile.read(), file = sys.stderr)
				sys.stderr.flush()

			print("=" * 80, file = sys.stderr)
			sys.stderr.flush()

	# Writes the updated report
	def writeData(self):
		self.writeDataInternal(self.fileName(), self.header, self.data)
		if self.detailedData != None:
			self.writeDataInternal(self.detailedFileName(), self.detailedHeader, self.detailedData)

	# Update the report data, must be overridden in subclasses
	def updateData(self):
		raise RuntimeError("cannot make calls to abstract base class Report, updateData not implemented")

	# Performs the update by reading existing data, updating it (as defined by subclass), and writing the result
	def update(self):
		print("Started update of " + self.name() + ".tsv", file = sys.stderr)
		sys.stderr.flush()

		timeStart = time.time()

		self.readData()
		self.updateData()
		self.writeData()

		timeElapsed = PrettyFloat(time.time() - timeStart)
		self.metaStats["runtimes"].append([self.name(), timeElapsed])

		print("Finished update of " + self.name() + ".tsv (runtime: " + str(timeElapsed) + " s)", file = sys.stderr)
		sys.stderr.flush()

	def andExcludedEntities(self, column, delimiter = "AND"):
		query = ""
		for excludedEntity in self.configuration["excludedEntities"]:
			query += " " + delimiter + " " + column + ' NOT LIKE "' + excludedEntity + '" '
			delimiter = "AND"
		return query

	def andExcludedUsers(self, column, delimiter = "AND"):
		query = ""
		for excludedUser in self.configuration["excludedUsers"]:
			query += " " + delimiter + " " + column + ' NOT LIKE "' + excludedUser + '" '
			delimiter = "AND"
		return query

	def whereExcludedUsers(self, column):
		return self.andExcludedUsers(column, "WHERE")

	def andExcludeMemberlessOrganizations(self, orgs):
		query = ""
		for excludedUser in self.configuration["memberlessOrganizations"]:
			query += ' AND ' + orgs + '.login NOT LIKE "' + excludedUser + '" '
		return query
