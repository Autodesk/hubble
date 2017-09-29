import calendar
import datetime
from .ReportDaily import *

# Calculate percentage of active repositories with a least two contributors
# in organizations that have used pull requests over the last 4 weeks.
# An active repository is an repository that receives pushes.
#
# TODO: Might be sufficient to run this report once a month!
class ReportPRUsage(ReportDaily):
	def name(self):
		return "pull-request-usage"

	def updateDailyData(self):
		if len(self.data) == 0:
			range = self.timeRangeTotal()
			date = range[0].replace(day=1)
			while date < range[1]:
				days_in_month = calendar.monthrange(date.year, date.month)[1]
				date += datetime.timedelta(days_in_month)
				newHeader, newData = self.parseData(
					self.executeQuery(self.query(date))
				)
				self.data.extend(newData)
		newHeader, newData = self.parseData(
			self.executeQuery(self.query(self.yesterday()))
		)
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self, date):
		lastFourWeeks = date - datetime.timedelta(7*4)
		query = '''
			SELECT
				"''' + str(date) + '''" AS date,
				ROUND(100*COUNT(pr.repository_id)/COUNT(active.repository_id)) AS "Pull request usage in %",
				ROUND(100*COUNT(status.repository_id)/COUNT(active.repository_id)) AS "Status usage in %"
			FROM
				(
					SELECT repository_id
					FROM pushes, repositories, users
					WHERE cast(pushes.created_at AS date) BETWEEN
						"''' + str(lastFourWeeks) + '''" AND "''' + str(date) + '''" AND
						pushes.repository_id = repositories.id AND
						repositories.owner_id = users.id AND
						users.type = "organization"
					GROUP BY repositories.id
					HAVING COUNT(pushes.pusher_id) > 1
				) AS active
				LEFT JOIN (
					SELECT DISTINCT(repository_id)
					FROM pull_requests
					WHERE CAST(pull_requests.created_at AS date) BETWEEN
						"''' + str(lastFourWeeks) + '''" AND "''' + str(date) + '''"
				) AS pr ON active.repository_id = pr.repository_id
				LEFT JOIN (
					SELECT DISTINCT(repository_id)
					FROM statuses
					WHERE CAST(statuses.created_at as date) BETWEEN
						"''' + str(lastFourWeeks) + '''" AND "''' + str(date) + '''"
				) AS status ON active.repository_id = status.repository_id
		'''
		return query
