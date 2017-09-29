from .ReportDaily import *

# Find all forks in organizations that have a parent in an organization.
# Organizational repositories should have only one source of truth on
# the entire instance.
#
# c.f. https://medium.com/@larsxschneider/talk-dont-fork-743a1253b8d5
class ReportForksToOrgs(ReportDaily):
	def name(self):
		return "forks-to-organizations"

	def updateDailyData(self):
		self.detailedHeader, self.detailedData = self.parseData(self.executeQuery(self.query()))
		if len(self.data) == 0:
			self.header = ["date", "forks"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of forks in organizations
	def query(self):
		query = '''
			SELECT
				CONCAT(organizations.login, "/", repositories.name) AS "Fork",
				CAST(repositories.created_at AS date) AS "Creation Date"
			FROM
				users AS organizations,
				repositories,
				users AS parentOrganizations,
				repositories AS parentRepositories
			WHERE
				organizations.login not LIKE "discarded%" AND
				organizations.type = "organization" AND
				repositories.owner_id = organizations.id AND
				repositories.name not LIKE "discarded%" AND
				parentOrganizations.login not LIKE "discarded%" AND
				parentOrganizations.type = "organization" AND
				parentRepositories.owner_id = parentOrganizations.id AND
				parentRepositories.id = repositories.parent_id
			ORDER BY
				repositories.created_at DESC
		'''
		return query
