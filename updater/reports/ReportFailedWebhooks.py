from .ReportDaily import *

# Report how many webhooks failed
class ReportFailedWebhooks(ReportDaily):
	def name(self):
		return "failed-webhooks"

	def updateDailyData(self):
		self.detailedHeader, self.detailedData = self.parseData(
			self.executeScript(self.scriptPath("failed-webhooks.sh")))
		self.header = ["date", "failed webhooks"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
