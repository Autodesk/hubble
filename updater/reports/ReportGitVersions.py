from .Report import *

# Lists which git version was used by how many users yesterday
class ReportGitVersions(Report):
	def name(self):
		return "git-versions"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeScript(os.path.join("scripts", "git-versions.sh"))
		)
