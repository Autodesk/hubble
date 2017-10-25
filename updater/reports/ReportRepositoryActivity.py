from .ReportDaily import *

# Lists the number of active repositories in total, in organizations, and in
# user spaces for the last day, week, and 4 weeks
class ReportRepositoryActivity(ReportDaily):
	def name(self):
		return "repository-activity"

	def updateDailyData(self):
		newHeader, newData = self.parseData(
			self.executeQuery(self.query())
		)
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of active repositories for a user type (user/organization) given a time range
	def subquery(self, userType, timeRange):
		query = '''
			SELECT
				COUNT(*) AS count
			FROM
			(
				SELECT
					repositories.id
				FROM
					repositories
					JOIN users ON repositories.owner_id = users.id
					JOIN pushes ON pushes.repository_id = repositories.id
				WHERE
					CAST(pushes.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"'''

		query += self.andExcludedEntities("users", "repositories")

		if userType != None:
			query += ''' AND
					users.type = "''' + userType + '''"'''

		query += '''
				GROUP BY
					repositories.id
			) AS activeRepositories'''

		return query

	# Collects the number of repositories in total, in organizations, and in user spaces
	def query(self):
		oneDayAgo = self.yesterday()
		oneWeekAgo = self.daysAgo(7)
		fourWeeksAgo = self.daysAgo(28)

		query = '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				totalLastFourWeeks.count AS "total (last four weeks)",
				totalLastWeek.count AS "total (last week)",
				totalLastDay.count AS "total (last day)",
				organizationSpaceLastFourWeeks.count AS "in organizations (last four weeks)",
				organizationSpaceLastWeek.count AS "in organizations (last week)",
				organizationSpaceLastDay.count AS "in organizations (last day)",
				userSpaceLastFourWeeks.count AS "in user spaces (last four weeks)",
				userSpaceLastWeek.count AS "in user spaces (last week)",
				userSpaceLastDay.count AS "in user spaces (last day)"
			FROM
				(''' + self.subquery(None, [fourWeeksAgo, oneDayAgo]) + ''') AS totalLastFourWeeks,
				(''' + self.subquery(None, [oneWeekAgo, oneDayAgo]) + ''') AS totalLastWeek,
				(''' + self.subquery(None, [oneDayAgo, oneDayAgo]) + ''') AS totalLastDay,
				(''' + self.subquery("Organization", [fourWeeksAgo, oneDayAgo]) + ''') AS organizationSpaceLastFourWeeks,
				(''' + self.subquery("Organization", [oneWeekAgo, oneDayAgo]) + ''') AS organizationSpaceLastWeek,
				(''' + self.subquery("Organization", [oneDayAgo, oneDayAgo]) + ''') AS organizationSpaceLastDay,
				(''' + self.subquery("User", [fourWeeksAgo, oneDayAgo]) + ''') AS userSpaceLastFourWeeks,
				(''' + self.subquery("User", [oneWeekAgo, oneDayAgo]) + ''') AS userSpaceLastWeek,
				(''' + self.subquery("User", [oneDayAgo, oneDayAgo]) + ''') AS userSpaceLastDay
			'''

		return query
