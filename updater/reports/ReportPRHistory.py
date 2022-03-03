from .ReportDaily import *

# Lists the number of merged and new pull requests for each month in the last two years
class ReportPRHistory(ReportDaily):
	def name(self):
		return "pull-request-history"

	def updateDailyData(self):
		# Collect the missing data that should be added with this update
		self.header, newData = self.parseData(
			self.executeDatabaseQueryOnServer(self.query(self.timeRangeToUpdate())))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of either merged or new pull requests
	def subquery(self, type, timeRange):
		return '''
			SELECT
				DATE_FORMAT(pull_requests.''' + type + ''', "%Y-%m-%d") AS date,
				COUNT(*) AS count
			FROM
				pull_requests,
				users
			WHERE
				CAST(pull_requests.''' + type + ''' AS date) BETWEEN
					"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
				AND pull_requests.user_id = users.id
				''' + self.andExcludedUsers("users.login") + '''
			GROUP BY
				date_format(pull_requests.''' + type + ''', "%Y-%m-%d")
			ORDER BY
				date DESC'''

	# Collects all the results for merged and new pull requests
	def query(self, timeRange):
		return '''
			SELECT
				created.date AS date,
				merged.count AS merged,
				created.count AS new
			FROM
				(''' + self.subquery("merged_at", timeRange) + ''') AS merged,
				(''' + self.subquery("created_at", timeRange) + ''') AS created
			WHERE
				created.date = merged.date
			GROUP BY
				created.date
			ORDER BY
				date DESC'''
