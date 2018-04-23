from .ReportDaily import *

# Lists the number of active repositories in total, in organizations, and in
# user accounts for the last day, week, and 4 weeks
#
# The detailed report lists the names of all active repositories in
# organizations over the last 4 weeks.
#
# Attention: Keep the notion of "active" repository in sync with the
# implementation in ReportRepoActivity and ReportPRUsage!
class ReportRepoActivity(ReportDaily):
	def name(self):
		return "repository-activity"

	def updateDailyData(self):
		self.header, newData = self.parseData(self.executeQuery(self.query()))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
		self.detailedHeader, self.detailedData = self.parseData(
			self.executeQuery(self.detailedQuery()))

	# Collects active repositories for a user type (user/organization)
	# given a time range
	def activeRepos(self, userType, timeRange):
		return '''
			SELECT
				repositories.id AS repository_id,
				CONCAT(users.login, "/", repositories.name) as repository,
				COUNT(DISTINCT(pushes.pusher_id)) AS pusher_count,
				COUNT(pushes.id) AS push_count
			FROM
				repositories
				JOIN users ON repositories.owner_id = users.id
				JOIN pushes ON pushes.repository_id = repositories.id
			WHERE
				CAST(pushes.created_at AS DATE) BETWEEN
					"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
				''' + ('AND users.type = "' + userType + '"' if userType != None else '') + '''
				''' + self.andExcludedEntities("users.login") + '''
				''' + self.andExcludedEntities("repositories.name") + '''
			GROUP BY
				repositories.id'''

	# Counts the number of active repositories for a user type (user/organization)
	# given a time range
	def countActiveRepos(self, userType, timeRange):
		return '''
			SELECT
				COUNT(*) AS count
			FROM
				(''' + self.activeRepos(userType, timeRange) + ''') AS activeRepos'''

	# Counts the number of repositories in total, in organizations, and in user accounts
	def query(self):
		oneDayAgo = self.yesterday()
		oneWeekAgo = self.daysAgo(7)
		fourWeeksAgo = self.daysAgo(28)

		return '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				totalLastFourWeeks.count AS "total (last four weeks)",
				totalLastWeek.count AS "total (last week)",
				totalLastDay.count AS "total (last day)",
				organizationSpaceLastFourWeeks.count AS "in organizations (last four weeks)",
				organizationSpaceLastWeek.count AS "in organizations (last week)",
				organizationSpaceLastDay.count AS "in organizations (last day)",
				userSpaceLastFourWeeks.count AS "in user accounts (last four weeks)",
				userSpaceLastWeek.count AS "in user accounts (last week)",
				userSpaceLastDay.count AS "in user accounts (last day)"
			FROM
				(''' + self.countActiveRepos(None, [fourWeeksAgo, oneDayAgo]) + ''') AS totalLastFourWeeks,
				(''' + self.countActiveRepos(None, [oneWeekAgo, oneDayAgo]) + ''') AS totalLastWeek,
				(''' + self.countActiveRepos(None, [oneDayAgo, oneDayAgo]) + ''') AS totalLastDay,
				(''' + self.countActiveRepos("Organization", [fourWeeksAgo, oneDayAgo]) + ''') AS organizationSpaceLastFourWeeks,
				(''' + self.countActiveRepos("Organization", [oneWeekAgo, oneDayAgo]) + ''') AS organizationSpaceLastWeek,
				(''' + self.countActiveRepos("Organization", [oneDayAgo, oneDayAgo]) + ''') AS organizationSpaceLastDay,
				(''' + self.countActiveRepos("User", [fourWeeksAgo, oneDayAgo]) + ''') AS userSpaceLastFourWeeks,
				(''' + self.countActiveRepos("User", [oneWeekAgo, oneDayAgo]) + ''') AS userSpaceLastWeek,
				(''' + self.countActiveRepos("User", [oneDayAgo, oneDayAgo]) + ''') AS userSpaceLastDay'''

	# Collects the active organizational repositories over the last 4 weeks
	def detailedQuery(self):
		oneDayAgo = self.yesterday()
		fourWeeksAgo = self.daysAgo(28)

		return '''
			SELECT
				repository,
				pusher_count as "pushers",
				push_count as "pushes"
			FROM
				(''' + self.activeRepos("Organization", [fourWeeksAgo, oneDayAgo]) + ''') AS activeRepos
			ORDER BY
				push_count DESC'''
