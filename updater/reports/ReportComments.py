from .ReportDailySQL import *

# Lists how many issues got created, closed, were commented on, and number of comments per day
class ReportComments(ReportDailySQL):
	def name(self):
		return "comments"

	def updateDailyData(self):
		self.header, newData = self.parseData(self.executeQuery(self.query(self.timeRangeToUpdate())))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	# Collects the issues closed in time range
	def subquery(self, timeRange, table, extra_from=None, extra_where=None):
		return '''
			SELECT
				DATE_FORMAT(''' + table + '''.created_at, "%Y-%m-%d") AS date,
				COUNT(*) AS count
			FROM
				''' + table + '''
				JOIN users ON users.id = ''' + table + '''.user_id ''' + (("\n\t\t\t\t\t" + extra_from) if extra_from else '') + '''
			WHERE
				CAST(''' + table + '''.created_at AS DATE) BETWEEN
					"''' + str(timeRange[0]) + '''" AND "''' + str(timeRange[1]) + '''"
					''' + self.andExcludedUsers("users.login") + (("\n\t\t\t\t\t" + extra_where) if extra_where else '') + '''
			GROUP BY
				date_format(''' + table + '''.created_at, "%Y-%m-%d")'''

	# Collects the number of issues created, closed, commented, and number of comments
	def query(self, timeRange):
		# `alldays` is used as a basis for LEFT JOIN, to prevent issues when querying multiple days, e.g. for initial run of the new report 
		return '''
			SELECT
			    alldays.date AS date,
				IFNULL(i_issues.count, 0) AS "issue comments",
				IFNULL(pr_issues.count, 0) AS "pull request issue comments",
				IFNULL(reviews.count, 0) AS "pull request review comments",
				IFNULL(pr_issues.count, 0) + IFNULL(reviews.count, 0) AS "pull request comments",
				IFNULL(commits.count, 0) AS "commit comments"
			FROM
				(''' + self.allDaysToUpdateUnion(timeRange) + ''') AS alldays
				LEFT JOIN (''' + self.subquery(timeRange, "issue_comments", "JOIN issues ON issues.id = issue_comments.issue_id", "AND issues.pull_request_id IS NULL") + ''') AS i_issues ON alldays.date = i_issues.date
				LEFT JOIN (''' + self.subquery(timeRange, "issue_comments", "JOIN issues ON issues.id = issue_comments.issue_id", "AND issues.pull_request_id IS NOT NULL") + ''') AS pr_issues ON alldays.date = pr_issues.date
				LEFT JOIN (''' + self.subquery(timeRange, "commit_comments") + ''') AS commits ON alldays.date = commits.date
				LEFT JOIN (''' + self.subquery(timeRange, "pull_request_review_comments") + ''') AS reviews ON alldays.date = reviews.date
			ORDER BY date DESC'''
