from .Report import *

# Lists all orgs and their owners without site admins or suspended users
class ReportOrgOwners(Report):
	def name(self):
		return "org-owners"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeScript(self.scriptPath("org-owners.sh"))
		)
