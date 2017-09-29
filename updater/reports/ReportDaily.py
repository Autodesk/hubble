from .Report import *

# A report that is updated daily by appending data rows to it, where the first column is a date
class ReportDaily(Report):

	# The date of the last update that has been recorded
	def timeOfLastUpdate(self):
		try:
			return parseDate(max(self.data, key = lambda row: row[0])[0])
		except ValueError:
			return None

	# The time range of the missing data that should be updated
	# Start and end of the time range are inclusive
	def timeRangeToUpdate(self):
		timeRange = self.timeRangeTotal()
		timeOfLastUpdate = self.timeOfLastUpdate()

		if timeOfLastUpdate != None:
			timeOfNextUpdate = timeOfLastUpdate + datetime.timedelta(1)

			return [timeOfNextUpdate, timeRange[1]]

		print("Malformed date format, rebuilding complete report", file = sys.stderr)
		sys.stderr.flush()

		self.data = []

		return timeRange

	def updateData(self):
		# Only update if the data isn’t recent
		timeOfLastUpdate = self.timeOfLastUpdate()
		if timeOfLastUpdate == None or timeOfLastUpdate < self.yesterday():
			self.updateDailyData()

	# Truncates the collected data to the specified time range
	def truncateData(self, timeRange):
		self.data = [row for row in self.data if timeRange[0] <= parseDate(row[0]) <= timeRange[1]]

	# Sorts the collected data by date (descending)
	def sortDataByDate(self):
		self.sortData(0, True)
