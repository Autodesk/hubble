import calendar

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
				_, newData = self.parseData(self.executeQuery(self.query(date)))
				self.data.extend(newData)
		self.header, newData = self.parseData(self.executeQuery(self.query(self.yesterday())))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self, date):
		lastFourWeeks = date - datetime.timedelta(7 * 4)

		return '''
			SELECT
				"''' + str(date) + '''" AS date,
				ROUND(100 * COUNT(pr.repository_id) / COUNT(active.repository_id))
					AS "pull request usage [%]",
				ROUND(100 * COUNT(status.repository_id) / COUNT(active.repository_id))
					AS "status usage [%]"
			FROM
				(
					SELECT
						repositories.id AS repository_id
					FROM
						repositories
						JOIN users ON repositories.owner_id = users.id
						JOIN pushes ON pushes.repository_id = repositories.id
					WHERE
						CAST(pushes.created_at AS DATE) BETWEEN
							"''' + str(lastFourWeeks) + '''" AND "''' + str(date) + '''"
						AND users.type = "Organization"
						''' + self.andExcludedEntities("users.login") + '''
						''' + self.andExcludedEntities("repositories.name") + '''
					GROUP BY
						repositories.id
					HAVING COUNT(pushes.pusher_id) > 1
				) AS active
				LEFT JOIN
				(
					SELECT DISTINCT(repository_id)
					FROM pull_requests
					WHERE CAST(pull_requests.created_at AS date) BETWEEN
						"''' + str(lastFourWeeks) + '''" AND "''' + str(date) + '''"
				) AS pr ON active.repository_id = pr.repository_id
				LEFT JOIN
				(
					SELECT DISTINCT(repository_id)
					FROM statuses
					WHERE CAST(statuses.created_at as date) BETWEEN
						"''' + str(lastFourWeeks) + '''" AND "''' + str(date) + '''"
				) AS status ON active.repository_id = status.repository_id'''
