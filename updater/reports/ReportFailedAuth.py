from .ReportDaily import *

# Report how many failed authentication attempts
class ReportFailedAuth(ReportDaily):
	def name(self):
		return "failed-auth"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(self.scriptPath("failed-auth.sh")))
		self.header = ["date", "failed authentication"]
		self.data.append(
			[
				str(self.yesterday()),
				sum(map(lambda x: int(x[4] if len(x) > 3 else 0), newData)),
			])
		self.detailedData = newData[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
