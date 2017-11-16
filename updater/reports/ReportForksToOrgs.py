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
			self.header = ["date", "forks to organizations"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of forks in organizations
	def query(self):
		query = '''
			SELECT
				CONCAT(orgs.login, "/", repos.name) AS fork,
				CAST(repos.created_at AS date) AS "creation date"
			FROM
				users AS orgs,
				repositories AS repos,
				users AS parentOrgs,
				repositories AS parentRepos
			WHERE
				orgs.type = "organization" AND
				repos.owner_id = orgs.id AND
				parentOrgs.type = "organization" AND
				parentRepos.owner_id = parentOrgs.id AND
				parentRepos.id = repos.parent_id
				''' + self.andExcludedEntities("orgs.login") \
					+ self.andExcludedEntities("repos.name") \
					+ self.andExcludedEntities("parentOrgs.login") \
					+ self.andExcludedEntities("parentRepos.name") + '''
			ORDER BY
				repos.created_at DESC
		'''
		return query
