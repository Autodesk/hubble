from .ReportDaily import *

# Report how many requests where made against the GHE instance
class ReportAPIRequests(ReportDaily):
	def name(self):
		return "api-requests"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(self.scriptPath("api-requests.sh")))
		self.header = ["date", "API requests", "internal requests"]
		apiReq = list(filter(lambda x: len(x) > 1 and x[2] != "127.0.0.1", newData))
		intReq = list(filter(lambda x: len(x) > 1 and x[2] == "127.0.0.1", newData))
		self.data.append(
			[
				str(self.yesterday()),
				sum(map(lambda x: int(x[3] if len(x) > 2 else 0), apiReq)),
				sum(map(lambda x: int(x[3] if len(x) > 2 else 0), intReq)),
			])
		self.detailedData = apiReq[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
