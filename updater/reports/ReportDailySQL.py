from .ReportDaily import *

# A daily report that also updates days in the past, given by timeRangeToUpdate
class ReportDailySQL(ReportDaily):

	def allDaysToUpdateUnion(self, timeRange):
		younger = max(timeRange)
		older = min(timeRange)
		snipped = "SELECT '" + str(younger) + "' AS date"
		while (younger > older):
			younger -= datetime.timedelta(1)
			snipped += " UNION SELECT '" + str(younger) + "'"
		return snipped
