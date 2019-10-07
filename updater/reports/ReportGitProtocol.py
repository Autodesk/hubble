from .ReportDaily import *

# Report what protocols is used to access Git repositories
class ReportGitProtocol(ReportDaily):
	def name(self):
		return "git-protocol"

	def updateDailyData(self):
		_, items = self.parseData(
			self.executeScript(self.scriptPath("git-protocol.sh")))

		protocols = {}
		for item in items:
			protocols[item[0]] = item[1]

		self.header = ["date", "http", "ssh"]
		self.data.append(
			[
				str(self.yesterday()),
				protocols.get("http", 0),
				protocols.get("ssh", 0),
			])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
