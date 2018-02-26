from .ReportDaily import *

# Lists which git version was used by how many users yesterday
class ReportTokenlessAuth(ReportDaily):
	def name(self):
		return "tokenless-authentication"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(self.scriptPath("tokenless-auth.sh"))
		)
		if len(self.data) == 0:
			self.header = ["date", "tokenless authentications"]
		self.data.append(
			[str(self.yesterday()),
			sum(map(lambda x: int(x[2] if len(x) > 1 else 0), newData))]
		)
		self.detailedData = newData[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
