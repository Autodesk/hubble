from .ReportDaily import *

# Report how much data is downloaded from the GHE instance
class ReportGitDownload(ReportDaily):
	def name(self):
		return "git-download"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(self.scriptPath("git-download.sh")))
		_, sumLFSTraffic = self.parseData(
			self.executeScript(self.scriptPath("git-lfs-download.sh")))
		self.header = \
			[
				"date",
				"clones",
				"fetches",
				"clone traffic [GB]",
				"fetch traffic [GB]",
				"LFS traffic [GB]",
			]
		self.data.append(
			[
				str(self.yesterday()),
				sum(map(lambda x: int(x[3] if len(x) > 2 and x[2] == "true" else 0), newData)),
				sum(map(lambda x: int(x[3] if len(x) > 2 and x[2] != "true" else 0), newData)),
				sum(map(lambda x: int(x[4] if len(x) > 3 and x[2] == "true" else 0), newData)) // (1024 ** 3),
				sum(map(lambda x: int(x[4] if len(x) > 3 and x[2] != "true" else 0), newData)) // (1024 ** 3),
				int(sumLFSTraffic[0][0] if len(sumLFSTraffic) > 0 and len(sumLFSTraffic[0]) > 0 else 0) // (1024 ** 3),
			])
		self.detailedHeader[4] = "download [GB]"
		self.detailedData = map(lambda x: [x[0], x[1], x[2], x[3], round(int(x[4]) / (1024 ** 3))], newData[:25])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
