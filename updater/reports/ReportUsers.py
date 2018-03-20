from .ReportDaily import *

# Lists how many users pushed commits vs. how many used a seat in the last day, week, and four weeks
class ReportUsers(ReportDaily):
	def name(self):
		return "users"

	def updateDailyData(self):
		self.header, newData = self.parseData(self.executeQuery(self.query()))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of users who pushed commits yesterday
	def usersPushingSubquery(self, timeRange):
		return '''
			SELECT
				COUNT(DISTINCT users.id) AS count
			FROM
				pushes
				JOIN users ON users.id = pushes.pusher_id
			WHERE
				CAST(pushes.created_at AS DATE) BETWEEN
					"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
				''' + self.andExcludedUsers("users.login")

	# Collects the number of users who currently use up a seat
	def usersUsingSeatSubquery(self):
		return '''
			SELECT
				COUNT(*) AS count
			FROM
				users
			WHERE
				users.type = "User" AND
				users.suspended_at IS NULL'''

	# Collects the number of pushing users and users using a seat
	def query(self):
		oneDayAgo = self.yesterday()
		oneWeekAgo = self.daysAgo(7)
		fourWeeksAgo = self.daysAgo(28)

		return '''
			SELECT
				"''' + str(oneDayAgo) + '''" AS date,
				usersPushingYesterday.count AS "pushing commits (last day)",
				usersPushingLastWeek.count AS "pushing commits (last week)",
				usersPushingLastFourWeeks.count AS "pushing commits (last four weeks)",
				usersUsingSeat.count AS "using license"
			FROM
				(''' + self.usersPushingSubquery([oneDayAgo, oneDayAgo]) + ''') AS usersPushingYesterday,
				(''' + self.usersPushingSubquery([oneWeekAgo, oneDayAgo]) + ''') AS usersPushingLastWeek,
				(''' + self.usersPushingSubquery([fourWeeksAgo, oneDayAgo]) + ''') AS usersPushingLastFourWeeks,
				(''' + self.usersUsingSeatSubquery() + ''') AS usersUsingSeat'''
