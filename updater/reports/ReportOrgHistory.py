from .ReportDaily import *

# Lists the total number of organizations
class ReportOrgHistory(ReportDaily):
	def name(self):
		return "org-history"

	def updateDailyData(self):
		newHeader, newData = self.parseData(
			self.executeQuery(self.query())
		)
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of organizations
	def subquery(self, userType):
		query = '''
			SELECT
				COUNT(*) AS count
			FROM
				users
			WHERE
				users.type = "Organization"
			AND
				users.login <> "github-enterprise"
			'''

		return query

	# Collects the number of teams
	def totalTeamsQuery(self, userType):
		query = '''
			SELECT
				COUNT(*) AS count
			FROM
				teams
			'''

		return query

	# Collects the number of organizations in total, and the number of teams in total
	def query(self):
		query = '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				total.count AS total,
				teamsTotal.count AS teams
			FROM
				(''' + self.subquery(None) + ''') AS total,
				(''' + self.totalTeamsQuery(None) + ''') AS teamsTotal
			'''

		return query
