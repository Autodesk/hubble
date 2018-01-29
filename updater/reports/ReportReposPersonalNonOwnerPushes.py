from .ReportDaily import *

# Find personal repositories that nonowners are pushing to.
# These repositories should be moved into organizations.
# Only look at active users (not suspended!) and only look at pushes
# of the last 4 weeks.
class ReportReposPersonalNonOwnerPushes(ReportDaily):
	def name(self):
		return "repositories-personal-nonowner-pushes"

	def updateDailyData(self):
		self.detailedHeader, self.detailedData = self.parseData(self.executeQuery(self.query()))
		if len(self.data) == 0:
			self.header = ["date", "personal repositories with nonowner pushes"]
		self.data.append([str(self.yesterday()), len(self.detailedData)])
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self):
		fourWeeksAgo = self.daysAgo(28)
		query = '''
			SELECT
				CONCAT(users.login, "/", repositories.name) as "repository"
			FROM
				repositories
				JOIN users ON repositories.owner_id = users.id
				JOIN pushes ON pushes.repository_id = repositories.id
			WHERE
				users.type = "user"
				AND users.suspended_at IS NULL
				AND CAST(pushes.created_at AS DATE) BETWEEN "''' + str(fourWeeksAgo) + '''" AND "''' + str(self.yesterday()) + '''"
				AND pushes.pusher_id != users.id
			GROUP BY
				repositories.id
			ORDER BY
				1
		'''
		return query
