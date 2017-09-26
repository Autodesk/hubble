#!/usr/bin/python3

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
			select
				concat(users.login, "/", repositories.name) as repository,
				count(case when pull_requests.merged_at is not null and cast(pull_requests.merged_at as date) between "''' + str(timeRange[0]) + '''" and "''' + str(timeRange[1]) + '''" then 1 else null end) as merged,
				count(case when pull_requests.created_at is not null and cast(pull_requests.created_at as date) between "''' + str(timeRange[0]) + '''" and "''' + str(timeRange[1]) + '''" then 1 else null end) as new
			from
				pull_requests
				join repositories on repositories.id = pull_requests.repository_id
				join users on users.id = repositories.owner_id
		'''

		if (len(self.configuration["excludedUsers"]) > 0):
			delimiter = ' WHERE '
			for excludedUser in self.configuration["excludedUsers"]:
				query += delimiter + 'users.login NOT LIKE "' + excludedUser + '"'
				delimiter = ' AND '

		query += '''
			GROUP BY
				repositories.id
			ORDER BY
				merged DESC,
				repositories.id ASC
			LIMIT
				50
		'''
		return query
