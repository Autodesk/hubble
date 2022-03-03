from .ReportDaily import *

# Report how many requests where made against the GHE instance
class ReportGitRequests(ReportDaily):
	def name(self):
		return "git-requests"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(self.executeScript("git-requests.sh"))
		self.header = ["date", "Git requests"]
		self.data.append(
			[
				str(self.yesterday()),
				sum(map(lambda x: int(x[2] if len(x) > 1 else 0), newData)),
			])
		self.detailedData = newData[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
