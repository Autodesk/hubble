from ..Report import *

# Abstract base class for all repository reports
class ReportRepository(Report):
	def metaName(self):
		return self.repository + "/" + self.name()

	def fileName(self):
		return os.path.join(self.dataDirectory, "repository", self.repositoryOwner, self.repositoryName, self.name() + ".tsv")