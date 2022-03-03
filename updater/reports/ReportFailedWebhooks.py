from .ReportDaily import *

# Report how many webhooks failed
class ReportFailedWebhooks(ReportDaily):
	def name(self):
		return "failed-webhooks"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeBashScriptOnServer("failed-webhooks.sh"))
		self.header = ["date", "failed webhooks"]
		self.data.append(
			[
				str(self.yesterday()),
				sum(map(lambda x: int(x[4] if len(x) > 3 else 0), newData)),
			])
		self.detailedData = newData[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
