import os

from ..ReportGitDownload import *

# Report how much data is downloaded from the GHE instance for a specific repository
class ReportGitHubGitDownload(ReportGitDownload):
	def name(self):
		return "github-git-download"

	def metaName(self):
		return self.repository + "/" + self.name()

	def fileName(self):
		return os.path.join(self.dataDirectory, "repository", self.repositoryOwner, self.repositoryName, self.name() + ".tsv")

	def detailedFileName(self):
		return os.path.join(self.dataDirectory, "repository", self.repositoryOwner, self.repositoryName, self.name() + "-detailed.tsv")