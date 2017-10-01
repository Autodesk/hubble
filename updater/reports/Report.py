import csv
import datetime
import io
import os
import subprocess
import sys
import time

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

	# Executes a script but prints stderr and returns stdout only
	def executeScript(self, script, stdin = None):
		if self.configuration["remoteRun"]["enabled"]:
			try:
				with open(script) as f:
					assert(stdin == None)
					stdin = f.read()
				command = ["bash -s", "--"]
			except:
				command = script
			script = [
				"ssh",
				"-i", self.configuration["remoteRun"]["sshKey"],
				"-p", "122",
				"admin@" + self.configuration["remoteRun"]["gheHost"],
			] +	command
		stdout, stderr = executeCommand(script, stdin)

		print(stderr.decode("utf-8"), file = sys.stderr)
		sys.stderr.flush()

		return stdout

	# Executes a database query, given as a string
	def executeQuery(self, query):
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

	def andExcludedEntities(self, org, repo):
		query = ""
		if ("excludedEntities" in self.configuration and
		   len(self.configuration["excludedEntities"]) > 0):
			if org:
				query += ' AND ' + org + '.login not LIKE "' + \
				         self.configuration["excludedEntities"] + '" '
			if repo:
				query += ' AND ' + repo + '.name not LIKE "' + \
				         self.configuration["excludedEntities"] +'" '
		return query

	def andExcludedUsers(self, users, delimiter = "AND"):
		query = ""
		for excludedUser in self.configuration["excludedUsers"]:
			query += " " + delimiter + " " + users + '.login NOT LIKE "' + excludedUser + '" '
			delimiter = "AND"
		return query

	def whereExcludedUsers(self, users):
		return self.andExcludedUsers(users, "WHERE")

	def andExcludeMemberlessOrganizations(self, orgs):
		query = ""
		for excludedUser in self.configuration["memberlessOrganizations"]:
			query += ' AND ' + orgs + '.login NOT LIKE "' + excludedUser + '" '
		return query

