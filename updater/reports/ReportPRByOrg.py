from .Report import *

# Lists the number of merged and new pull requests for each organization in the last 30 days
# Ordered by the number of merged pull requests in descending order
class ReportPRByOrg(Report):
	def name(self):
		return "pull-requests-by-organization"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeQuery(self.query([self.daysAgo(30), self.yesterday()])))

	# Collects the number of merged and new pull requests per organization
	def query(self, timeRange):
		return '''
			SELECT
				users.login AS organization,
				COUNT(
					CASE
						WHEN
							pull_requests.merged_at IS NOT NULL
							AND CAST(pull_requests.merged_at AS date) BETWEEN
								"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
						THEN 1
						ELSE NULL
					END) AS merged,
				COUNT(
					CASE
						WHEN
							pull_requests.created_at IS NOT NULL
							AND CAST(pull_requests.created_at AS date) BETWEEN
								"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
						THEN 1
						ELSE NULL
					END) AS new
			FROM
				pull_requests
				JOIN repositories ON repositories.id = pull_requests.repository_id
				JOIN users ON users.id = repositories.owner_id
			''' + self.whereExcludedUsers("users.login") + '''
			GROUP BY
				users.id
			ORDER BY
				merged DESC,
				users.id ASC
			LIMIT
				50'''
