from .ReportDaily import *

# Calculate percentage of active repositories over the last four weeks
# in organizations that have received pushes to at least one protected
# branch and that have at least one topic assigned to them.
class ReportRepoUsage(ReportDaily):
	def name(self):
		return "repository-usage"

	def updateDailyData(self):
		newHeader, newData = self.parseData(self.executeQuery(self.query()))
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
		self.detailedHeader, self.detailedData = self.parseData(self.executeQuery(self.detailedQuery()))


	def detailedQuery(self):
		query = '''
			SELECT
				org, repo
			FROM (
		'''
		query += self.activeReposQuery()
		query += '''
			) AS active
			INNER JOIN
			(
				SELECT repository_id, COUNT(*) AS count
				FROM pushes
				GROUP BY repository_id
			) AS push_tally
			ON active.repository_id = push_tally.repository_id
			ORDER BY count DESC
		'''
		return query

	def activeReposQuery(self):
		oneDayAgo = self.yesterday()
		fourWeeksAgo = self.daysAgo(28)
		query = '''
			SELECT
				repositories.id AS repository_id,
				users.login AS org,
				repositories.name AS repo,
				pushes.ref
			FROM
				repositories
				JOIN users ON repositories.owner_id = users.id
				JOIN pushes ON pushes.repository_id = repositories.id
			WHERE
				CAST(pushes.created_at AS DATE) BETWEEN "''' + str(fourWeeksAgo) + '''" AND "''' + str(oneDayAgo) + '''"
				AND users.type = "Organization" ''' + \
				self.andExcludedEntities("users.login") + \
				self.andExcludedEntities("repositories.name") + '''
			GROUP BY
				repositories.id
		'''
		return query

	def query(self):
		oneDayAgo = self.yesterday()
		fourWeeksAgo = self.daysAgo(28)
		query = '''
			SELECT
				"''' + str(oneDayAgo) + '''" AS date,
				ROUND(100 * COUNT(DISTINCT(protected.repository_id)) / COUNT(DISTINCT(active.repository_id)))
					AS "protected branches [%]",
				ROUND(100 * COUNT(DISTINCT(topics.repository_id)) / COUNT(DISTINCT(active.repository_id)))
					AS "topics [%]"
			FROM
				(
			'''
		query += self.activeReposQuery()
		query += '''
				) AS active
				LEFT JOIN (
					SELECT repository_id, name
					FROM protected_branches
				) AS protected ON active.repository_id = protected.repository_id AND active.ref = "refs/heads/" + protected.name
				LEFT JOIN (
					SELECT repository_id
					FROM repository_topics
				) AS topics ON active.repository_id = topics.repository_id
		'''
		return query
