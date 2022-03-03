from .ReportDaily import *

# Lists which git version was used by how many users yesterday
class ReportGitVersionsNew(ReportDaily):
	def name(self):
		return "git-versions-new"

	def updateDailyData(self):
		newHeader, newData = self.parseData(self.executeBashScriptOnServer("git-versions.sh"))

		self.header = ["date"] + newHeader

		newData = [[str(self.yesterday())] + row for row in newData]

		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
