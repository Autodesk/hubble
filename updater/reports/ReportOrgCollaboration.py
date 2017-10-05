from .Report import *

# Calculate the number of users that have contributed to more than one
# organization over the last two years
class ReportOrgCollaboration(Report):
	def name(self):
		return "org-collaboration"

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		newHeader, newData = self.parseData(
			self.executeQuery(self.query(self.yesterday()))
		)
		collab = {}
		orgs = []

		# Generate a dictionary to easily access the MySQL data
		for row in newData:
			source = row[0]
			target = row[1]
			count = row[2]
			if source not in collab:
				collab[source] = {}
			collab[source][target] = int(count)
			if source not in orgs:
				orgs.append(source)
			if target not in orgs:
				orgs.append(target)

		orgs.sort(key=lambda x: x.lower())
		matrix = [[0 for j in range(len(orgs))] for i in range(len(orgs))]

		# Transform the MySQL data into a matrix using the dictionary
		for sInd, sVal in enumerate(orgs):
			for tInd, tVal in enumerate(orgs):
				if sVal in collab and tVal in collab[sVal]:
					matrix[sInd][tInd] = collab[sVal][tVal]
				else:
					matrix[sInd][tInd] = 0

		self.header = orgs
		self.data = matrix

	def pushCountQuery(self, timeRange):
		query = '''
			SELECT orgs.login AS org_name, orgs.id AS org_id, pusher_id, COUNT(*) AS push_count
			FROM users AS orgs, repositories, pushes
			WHERE orgs.type = "organization"
			  AND orgs.id = repositories.owner_id
			  AND repositories.id = pushes.repository_id
			  AND cast(pushes.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" and "''' + str(timeRange[1]) + '''"
			  ''' + self.andExcludedEntities("orgs", "repositories") \
			      + self.andExcludeMemberlessOrganizations("orgs") + '''
			GROUP BY org_id, pusher_id
		'''
		return query

	# Calculate the "home" org of a user based on the number of pushes in given time range
	# Explained here: https://stackoverflow.com/a/28090544
	def homeOrgQuery(self, timeRange):
		query = '''
			SELECT a.org_name, a.org_id, a.pusher_id, a.push_count
			FROM users, (''' + self.pushCountQuery(timeRange) +''' ) AS a
				LEFT JOIN  (''' + self.pushCountQuery(timeRange) +''' ) AS b
				ON     a.pusher_id = b.pusher_id
				   AND (   a.push_count < b.push_count
				        OR (a.push_count = b.push_count AND a.pusher_id != b.pusher_id)
				       )
			WHERE b.push_count is NULL AND a.pusher_id = users.id ''' \
				+ self.andExcludedUsers("users")
		return query

	# Calculates a table that contains all users that have contributed to a
	# given organization. The contributions could have been made via direct
	# pushes or via merged pull requests.
	def contributorsToOrgQuery(self, timeRange):
		query = '''
			SELECT org_name, org_id, contributor_id
			FROM (
				SELECT orgs.login AS org_name,
				       orgs.id AS org_id,
				       pushes.pusher_id AS contributor_id
				FROM users AS orgs,
				     repositories,
				     pushes
				WHERE orgs.type = "organization"
				  AND orgs.id = repositories.owner_id
				  AND repositories.id = pushes.repository_id
				  AND cast(pushes.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" and "''' + str(timeRange[1]) + '''"
				  ''' + self.andExcludedEntities("orgs", "repositories") + '''

				UNION

				SELECT orgs.login AS org_name,
				       orgs.id AS org_id,
				       pull_requests.user_id AS contributor_id
				FROM users AS orgs,
				     repositories,
				     pull_requests
				WHERE orgs.type = "organization"
				  AND orgs.id = repositories.owner_id
				  AND repositories.id = pull_requests.repository_id
				  AND pull_requests.merged_at IS NOT NULL
				  AND cast(pull_requests.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" and "''' + str(timeRange[1]) + '''"
				  ''' + self.andExcludedEntities("orgs", "repositories") + '''
			) contributors
			GROUP BY org_id, contributor_id
		'''
		return query

	def query(self, date):
		query = '''
			SELECT source.org_name AS source,
			       target.org_name AS target,
			       COUNT(*) AS org_count
			FROM
				(''' + self.homeOrgQuery(self.timeRangeTotal()) + ''') AS source
				LEFT JOIN (''' + self.contributorsToOrgQuery(self.timeRangeTotal()) + ''') AS target
					ON source.pusher_id = target.contributor_id
			WHERE source.org_id != target.org_id
			GROUP BY source.org_id,
			         target.org_id
		'''
		return query
