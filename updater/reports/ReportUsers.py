#!/usr/bin/python3

from .ReportDaily import *

# Lists how many users pushed commits vs. how many used a seat in the last day, week, and month
class ReportUsers(ReportDaily):
	def name(self):
		return "users"

	def updateDailyData(self):
		newHeader, newData = self.parseData(
			self.executeQuery(self.query(self.yesterday()))
		)
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the number of users who pushed commits yesterday
	def usersPushingSubquery(self, timeRange):
		query = '''
			SELECT
				COUNT(DISTINCT users.id) AS count
			FROM
				pushes
				JOIN users ON users.id = pushes.pusher_id
			WHERE
				CAST(pushes.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
		'''

		for excludedUser in self.configuration["excludedUsers"]:
			query += ' AND users.login NOT LIKE "' + excludedUser + '"'

		return query

	# Collects the number of users who currently use up a seat
	def usersUsingSeatSubquery(self):
		query = '''
			SELECT
				COUNT(*) AS count
			FROM
				users
			WHERE
				users.type = "User" AND
				users.suspended_at IS NULL
		'''

		return query

	# Collects the number of pushing users and users using a seat
	def query(self, date):
		# Also compute the stats for a 7-day and a 30-day period
		sevenDaysEarlier = date - datetime.timedelta(6)
		thirtyDaysEarlier = date - datetime.timedelta(29)
		query = '''
			SELECT
				"''' + str(date) + '''" AS date,
				usersPushingYesterday.count AS "pushing commits (last day)",
				usersPushingLastWeek.count AS "pushing commits (last week)",
				usersPushingLastMonth.count AS "pushing commits (last month)",
				usersUsingSeat.count AS "using license"
			FROM
				(''' + self.usersPushingSubquery([date, date]) + ''') AS usersPushingYesterday,
				(''' + self.usersPushingSubquery([sevenDaysEarlier, date]) + ''') AS usersPushingLastWeek,
				(''' + self.usersPushingSubquery([thirtyDaysEarlier, date]) + ''') AS usersPushingLastMonth,
				(''' + self.usersUsingSeatSubquery() + ''') AS usersUsingSeat
		'''
		return query
