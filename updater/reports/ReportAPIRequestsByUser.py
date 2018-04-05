from .Report import *

# Calculate the top 20 users generating the most API calls
class ReportAPIRequestsByUser(Report):

	def name(self):
		return "api-requests-by-user"

	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeScript(self.scriptPath("api-requests-by-user.sh")))
