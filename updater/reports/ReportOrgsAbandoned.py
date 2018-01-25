from .ReportDaily import *

# Find the organizations that have not received a push for the longest time.
# Only look at organizations that have not received a push for at least one
# year. Only look at repositories that are still maintained (not archived!).
class ReportOrgsAbandoned(ReportDaily):
	def name(self):
		return "organizations-abandoned"

	def updateDailyData(self):
		self.detailedHeader, self.detailedData = self.parseData(self.executeQuery(self.query()))
		if len(self.data) == 0:
			self.header = ["date", "abandoned organizations"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self):
		query = '''
			SELECT
				users.login AS "organization",
				DATE(MAX(pushes.created_at)) AS "last push"
			FROM
				repositories
				JOIN users ON repositories.owner_id = users.id
				JOIN pushes ON pushes.repository_id = repositories.id
			WHERE
				users.type = "organization"
				AND repositories.maintained = 1 ''' + \
				self.andExcludedEntities("users.login") + '''
			GROUP BY
				users.id
			HAVING
				CAST(MAX(pushes.created_at) AS DATE) < "''' + str(self.daysAgo(365)) + '''"
			ORDER BY
				MAX(pushes.created_at)
		'''
		return query
