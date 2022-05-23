from .ReportDaily import *

# A daily report that also updates days in the past, given by timeRangeToUpdate
class ReportDailySQL(ReportDaily):

	def allDaysToUpdateUnion(self, timeRange):
		# This method creates a table column of every single date in timeRange.
		# It enables querying all results for timeRange in one single SQL query.
		# Furthermore the result will include 0 for days without results, which
		# makes the graphs look nicer especially on newly provisioned systems.
		younger = max(timeRange)
		older = min(timeRange)
		snipped = "SELECT '" + str(younger) + "' AS date"
		while (younger > older):
			younger -= datetime.timedelta(1)
			snipped += " UNION SELECT '" + str(younger) + "'"
		return snipped
