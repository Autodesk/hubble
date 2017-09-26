#!/usr/bin/python3

from .ReportDaily import *

# Report how many requests where made against the GHE instance
class ReportAPIRequests(ReportDaily):
	def name(self):
		return "api-requests"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(os.path.join("scripts", "api-requests.sh"))
		)
		if len(self.data) == 0:
			self.header = ["date", "API Requests/Day"]
		self.data.append(
			[str(self.yesterday()),
			sum(map(lambda x: int(x[3] if len(x) > 2 else 0), newData))]
		)
		self.detailedData = newData[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
