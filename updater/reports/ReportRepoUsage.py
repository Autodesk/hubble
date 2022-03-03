from .ReportDaily import *

# Calculate percentage of active repositories over the last four weeks
# in organizations that have received pushes to at least one protected
# branch and that have at least one topic assigned to them.
class ReportRepoUsage(ReportDaily):
	def name(self):
		return "repository-usage"

	def updateDailyData(self):
		self.header, newData = self.parseData(self.executeDatabaseQueryOnServer(self.query()))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self):
		oneDayAgo = self.yesterday()
		fourWeeksAgo = self.daysAgo(28)

		return '''
			SELECT
				"''' + str(oneDayAgo) + '''" AS date,
				ROUND(100 * COUNT(DISTINCT(protected.repository_id)) / COUNT(DISTINCT(active.repository_id)))
					AS "protected branches [%]",
				ROUND(100 * COUNT(DISTINCT(topics.repository_id)) / COUNT(DISTINCT(active.repository_id)))
					AS "topics [%]"
			FROM
				(
					SELECT
						repositories.id AS repository_id,
						pushes.ref
					FROM
						repositories
						JOIN users ON repositories.owner_id = users.id
						JOIN pushes ON pushes.repository_id = repositories.id
					WHERE
						CAST(pushes.created_at AS DATE) BETWEEN
							"''' + str(fourWeeksAgo) + '''" AND "''' + str(oneDayAgo) + '''"
						AND users.type = "Organization"
						''' + self.andExcludedEntities("users.login") + '''
						''' + self.andExcludedEntities("repositories.name") + '''
					GROUP BY
						repositories.id
				) AS active
				LEFT JOIN
				(
					SELECT repository_id, name
					FROM protected_branches
				) AS protected
					ON
						active.repository_id = protected.repository_id
						AND active.ref = "refs/heads/" + protected.name
				LEFT JOIN
				(
					SELECT repository_id
					FROM repository_topics
				) AS topics
					ON
						active.repository_id = topics.repository_id'''
