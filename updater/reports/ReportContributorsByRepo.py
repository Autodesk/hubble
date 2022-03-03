from .Report import *

# Lists the number of contributors for each repository
# Ordered by the number of contributors in descending order
class ReportContributorsByRepo(Report):
	def name(self):
		return "contributors-by-repository"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeDatabaseQueryOnServer(self.query([self.daysAgo(30), self.yesterday()])))

	# Collects the number of contributors per repository
	def query(self, timeRange):
		return '''
			SELECT
				CONCAT(users.login, "/", repositories.name) AS repository,
				COUNT(DISTINCT pull_requests.user_id) AS contributors
			FROM
				pull_requests
				JOIN repositories on repositories.id = pull_requests.repository_id
				JOIN users on users.id = repositories.owner_id
			WHERE
				pull_requests.created_at IS NOT NULL
				AND CAST(pull_requests.created_at AS date) BETWEEN
					"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
				''' + self.andExcludedUsers("users.login") + '''
			GROUP BY
				repositories.id
			ORDER BY
				contributors DESC,
				repositories.id ASC
			LIMIT
				50'''
