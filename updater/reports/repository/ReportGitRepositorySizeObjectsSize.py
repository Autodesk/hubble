import json

from .ReportRepository import *

class ReportGitRepositorySizeObjectsSize(ReportRepository):
	def name(self):
		return "git-repository-size-objects-size"

	def convertBytesToMiB(self, bytes):
		return round(bytes / 1024 ** 2, 3)

	def updateData(self):
		stdout = self.executeScript(["ghe-repo", self.repository, "-c", self.configuration["gitSizerPath"] + " --json --json-version=2"])

		sizerData = json.loads(stdout.decode("utf-8"))

		self.header = \
			[
				"date",
				"commits [MiB]",
				"trees [MiB]",
				"blobs [MiB]"
			]

		self.data.append(
			[
				str(self.yesterday()),
				self.convertBytesToMiB(sizerData["uniqueCommitSize"]["value"]),
				self.convertBytesToMiB(sizerData["uniqueTreeSize"]["value"]),
				self.convertBytesToMiB(sizerData["uniqueBlobSize"]["value"])
			])