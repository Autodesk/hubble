import json

from .ReportRepository import *

class ReportGitRepositorySizeObjectsCount(ReportRepository):
	def name(self):
		return "git-repository-size-objects-count"

	def updateData(self):
		stdout = self.executeScript(["ghe-repo", self.repository, "-c", self.configuration["gitSizerPath"] + " --json --json-version=2"])

		sizerData = json.loads(stdout.decode("utf-8"))

		self.header = \
			[
				"date",
				"commits",
				"trees",
				"blobs",
				"tags",
				"refs"
			]

		self.data.append(
			[
				str(self.yesterday()),
				sizerData["uniqueCommitCount"]["value"],
				sizerData["uniqueTreeCount"]["value"],
				sizerData["uniqueBlobCount"]["value"],
				sizerData["uniqueTagCount"]["value"],
				sizerData["referenceCount"]["value"]
			])