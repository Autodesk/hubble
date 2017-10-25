from .ReportDaily import *

# Lists the total number of repositories
class ReportRepositoryHistory(ReportDaily):
	def name(self):
		return "repository-history"

	def updateDailyData(self):
		newHeader, newData = self.parseData(
			self.executeQuery(self.query())
		)
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of active repositories for a user type (user/organization) given a time range
	def subquery(self, userType):
		query = '''
			SELECT
				COUNT(*) AS count
			FROM
				repositories
				JOIN users ON repositories.owner_id = users.id
			WHERE
				TRUE ''' + self.andExcludedEntities("users", "repositories")

		if userType != None:
			query += ''' AND
				users.type = "''' + userType + '''"'''

		return query

	# Collects the number of repositories in total, in organizations, and in user accounts
	def query(self):
		query = '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				total.count AS total,
				organizationSpace.count AS "in organizations",
				userSpace.count AS "in user accounts"
			FROM
				(''' + self.subquery(None) + ''') AS total,
				(''' + self.subquery("Organization") + ''') AS organizationSpace,
				(''' + self.subquery("User") + ''') AS userSpace
			'''

		return query
