from .Report import *

# Lists the number of merged and new pull requests for each repository in the last 30 days
# Ordered by the number of merged pull requests in descending order
class ReportPRByRepo(Report):
	def name(self):
		return "pull-requests-by-repository"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeQuery(self.query([self.daysAgo(30), self.yesterday()])
		))

	# Collects the number of merged and new pull requests per repository
	def query(self, timeRange):
		query = '''
			SELECT
				CONCAT(users.login, "/", repositories.name) as repository,
				COUNT(
					CASE WHEN pull_requests.merged_at IS NOT NULL AND CAST(pull_requests.merged_at as date) between "''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
					THEN 1 ELSE NULL END
				) AS merged,
				COUNT(
					CASE WHEN pull_requests.created_at IS NOT NULL AND CAST(pull_requests.created_at as date) between "''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
					THEN 1 ELSE NULL END
				) AS new
			FROM
				pull_requests
				join repositories ON repositories.id = pull_requests.repository_id
				join users on users.id = repositories.owner_id
		''' + self.whereExcludedUsers("users.login") + '''
			GROUP BY
				repositories.id
			ORDER BY
				merged DESC,
				repositories.id ASC
			LIMIT
				50
		'''
		return query
