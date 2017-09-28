from .Report import *

# Lists the number of contributors for each organization
# Ordered by the number of contributors in descending order
class ReportContributorsByOrg(Report):
	def name(self):
		return "contributors-by-organization"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeQuery(self.query([self.daysAgo(30), self.yesterday()])
		))

	# Collects the number of contributors per organization
	def query(self, timeRange):
		query = '''
			SELECT
				users.login AS organization,
				COUNT(DISTINCT pull_requests.user_id) AS contributors
			FROM
				pull_requests
				JOIN repositories ON repositories.id = pull_requests.repository_id
				JOIN users ON users.id = repositories.owner_id
			WHERE
				pull_requests.created_at IS NOT NULL AND CAST(pull_requests.created_at AS date) BETWEEN "''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
		'''

		for excludedUser in self.configuration["excludedUsers"]:
			query += ' AND users.login NOT LIKE "' + excludedUser + '"'

		query += '''
			GROUP by
				users.id
			ORDER by
				contributors DESC,
				users.id ASC
			LIMIT
				50
		'''
		return query
