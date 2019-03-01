from .Report import *

# Lists monitored repositories
class ReportReposMonitored(Report):
	def name(self):
		return "repository-monitored"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header = ['repository']
		self.data = map(lambda repository: [repository], self.configuration["monitoredRepositories"])
