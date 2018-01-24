from .ReportDaily import *

# Lists the number of active organizations for the last day, week, and 4 weeks
class ReportOrgActivity(ReportDaily):
	def name(self):
		return "organization-activity"

	def updateDailyData(self):
		newHeader, newData = self.parseData(
			self.executeQuery(self.query())
		)
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of active organizations for given a time range
	def subquery(self, timeRange):
		query = '''
			SELECT
				COUNT(*) AS count
			FROM
			(
				SELECT
					users.id
				FROM
					repositories
					JOIN users ON repositories.owner_id = users.id
					JOIN pushes ON pushes.repository_id = repositories.id
				WHERE
					users.type = "Organization" AND
					CAST(pushes.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"'''

		query += self.andExcludedEntities("users.login")

		query += '''
				GROUP BY
					users.id
			) AS activeOrganizations'''

		return query

	def query(self):
		oneDayAgo = self.yesterday()
		oneWeekAgo = self.daysAgo(7)
		fourWeeksAgo = self.daysAgo(28)

		query = '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				lastFourWeeks.count AS "last four weeks",
				lastWeek.count AS "last week",
				lastDay.count AS "last day"
			FROM
				(''' + self.subquery([fourWeeksAgo, oneDayAgo]) + ''') AS lastFourWeeks,
				(''' + self.subquery([oneWeekAgo, oneDayAgo]) + ''') AS lastWeek,
				(''' + self.subquery([oneDayAgo, oneDayAgo]) + ''') AS lastDay
			'''

		return query
