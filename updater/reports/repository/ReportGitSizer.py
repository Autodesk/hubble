import json

from .ReportRepository import *

class ReportGitSizer(ReportRepository):
	def name(self):
		return "git-sizer"

	def convertBytesToKiB(self, bytes):
		return round(bytes / 1024, 1)

	def convertBytesToMiB(self, bytes):
		return round(bytes / 1024 ** 2, 3)

	def updateData(self):
		stdout = self.executeScript(["ghe-repo", self.repository, "-c", self.configuration["gitSizerPath"] + " --json --json-version=2"])

		sizerData = json.loads(stdout.decode("utf-8"))

		getSizerDataValue = lambda key: sizerData[key]["value"]

		self.header = \
			[
				"date",

				# Overall repository size
				"commits",
				"commits [MiB]",
				"trees",
				"trees [MiB]",
				"tree entries",
				"blobs",
				"blobs [MiB]",
				"annotated tags",
				"refs",

				# Biggest objects
				"biggest commit [KiB]",
				"most parents",
				"most tree entries",
				"biggest blob [MiB]",

				# History structure
				"largest history depth",
				"largest tag depth",

				# Biggest checkouts
				"directories",
				"path depth",
				"path length",
				"files",
				"size of files [MiB]",
				"symlinks",
				"submodules"
			]

		self.data.append(
			[
				str(self.yesterday()),

				# Overall repository size
				getSizerDataValue("uniqueCommitCount"),
				self.convertBytesToMiB(getSizerDataValue("uniqueCommitSize")),
				getSizerDataValue("uniqueTreeCount"),
				self.convertBytesToMiB(getSizerDataValue("uniqueTreeSize")),
				getSizerDataValue("uniqueTreeEntries"),
				getSizerDataValue("uniqueBlobCount"),
				self.convertBytesToMiB(getSizerDataValue("uniqueBlobSize")),
				getSizerDataValue("uniqueTagCount"),
				getSizerDataValue("referenceCount"),

				# Biggest objects
				self.convertBytesToKiB(getSizerDataValue("maxCommitSize")),
				getSizerDataValue("maxCommitParentCount"),
				getSizerDataValue("maxTreeEntries"),
				self.convertBytesToMiB(getSizerDataValue("maxBlobSize")),

				# History structure
				getSizerDataValue("maxHistoryDepth"),
				getSizerDataValue("maxTagDepth"),

				# Biggest checkouts
				getSizerDataValue("maxCheckoutTreeCount"),
				getSizerDataValue("maxCheckoutPathDepth"),
				getSizerDataValue("maxCheckoutPathLength"),
				getSizerDataValue("maxCheckoutBlobCount"),
				self.convertBytesToMiB(getSizerDataValue("maxCheckoutBlobSize")),
				getSizerDataValue("maxCheckoutLinkCount"),
				getSizerDataValue("maxCheckoutSubmoduleCount")
			])