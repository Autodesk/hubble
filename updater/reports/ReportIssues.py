from .ReportDailySQL import *

# Lists how many issues got created, closed, and were updated per day
class ReportIssues(ReportDailySQL):
	def name(self):
		return "issues"

	def updateDailyData(self):
		self.header, newData = self.parseData(self.executeQuery(self.query(self.timeRangeToUpdate())))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
	
	# Collects the issues closed in time range
	def subquery(self, timeRange, type, extra=None):
		return '''
			SELECT
				DATE_FORMAT(issues.''' + type + ''', "%Y-%m-%d") AS date,
				COUNT(*) AS count
			FROM
				issues
				JOIN users ON users.id = issues.user_id
			WHERE
				issues.pull_request_id IS NULL AND
				CAST(issues.''' + type + ''' AS DATE) BETWEEN
					"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
					''' + self.andExcludedUsers("users.login") + (("\n\t\t\t\t\t" + extra) if extra else '') + '''
			GROUP BY
				date_format(issues.''' + type + ''', "%Y-%m-%d")'''

	# Collects the number of issues created, closed, commented, and number of comments
	def query(self, timeRange):
		# `alldays` is used as a basis for LEFT JOIN, to prevent issues when querying multiple days, e.g. for initial run of the new report
		return '''
			SELECT
			    alldays.date AS date,
				IFNULL(created.count, 0) AS "issues created",
				IFNULL(updated.count, 0) AS "issues updated",
				IFNULL(closed.count, 0) AS "issues closed"
			FROM
				(''' + self.allDaysToUpdateUnion(timeRange) + ''') AS alldays
				LEFT JOIN (''' + self.subquery(timeRange, "created_at") + ''') AS created ON alldays.date = created.date
				LEFT JOIN (''' + self.subquery(timeRange, "updated_at", "AND issues.created_at != issues.updated_at AND issues.closed_at != issues.updated_at") + ''') AS updated ON alldays.date = updated.date
				LEFT JOIN (''' + self.subquery(timeRange, "closed_at") + ''') AS closed ON alldays.date = closed.date
			ORDER BY date DESC'''
