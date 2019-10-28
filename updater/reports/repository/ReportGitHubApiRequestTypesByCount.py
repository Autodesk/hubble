from .ReportRepository import *

# Lists the number of GitHub api request types
# Ordered by count in descending order
class ReportGitHubApiRequestTypesByCount(ReportRepository):
	def name(self):
		return "github-api-request-types-by-count"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeScript(self.scriptPath("repository/github-api-request-types-by-count.sh")))