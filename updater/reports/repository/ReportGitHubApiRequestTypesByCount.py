from ..Report import *

# Lists the number of GitHub api request types
# Ordered by count in descending order
class ReportGitHubApiRequestTypesByCount(Report):
	def name(self):
		return "github-api-request-types-by-count"

	def metaName(self):
		return self.repository + "/" + self.name()

	def fileName(self):
		return os.path.join(self.dataDirectory, "repository", self.repositoryOwner, self.repositoryName, self.name() + ".tsv")

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeScript(self.scriptPath("repository/github-api-request-types-by-count.sh")))