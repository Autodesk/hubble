from .ReportDaily import *

# Report how much data is downloaded from the GHE instance
class ReportGitDownload(ReportDaily):
	def name(self):
		return "git-download"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(os.path.join("scripts", "git-download.sh"))
		)
		if len(self.data) == 0:
			self.header = [
				"date",
				"Clones/Day",
				"Fetches/Day",
				"Clone Traffic GB/Day",
				"Fetch Traffic GB/Day",
			]
		self.data.append([
			str(self.yesterday()),
			sum(map(lambda x: int(x[3] if len(x) > 2 and x[2] == "true" else 0), newData)),
			sum(map(lambda x: int(x[3] if len(x) > 2 and x[2] != "true" else 0), newData)),
			sum(map(lambda x: int(x[4] if len(x) > 3 and x[2] == "true" else 0), newData))//(1024**3),
			sum(map(lambda x: int(x[4] if len(x) > 3 and x[2] != "true" else 0), newData))//(1024**3),
		])
		self.detailedHeader[4] = "Download in GB/Day"
		self.detailedData = map(lambda x: [x[0], x[1], x[2], x[3], round(int(x[4])/(1024**3))], newData[:25])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
