#!/usr/bin/python3

from .Report import *

# Calculate the number of users that have contributed to more than one
# organization over the last year
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

		orgs.sort()
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

	def pushersPerOrgSubquery(self, timeRange):
		query = '''
			SELECT orgs.login as entity,
			       orgs.id as entity_id,
			       pushes.pusher_id,
			       COUNT(*) as push_count
			FROM users AS orgs,
			     repositories,
			     pushes
			WHERE orgs.type = "organization"
			  AND orgs.id = repositories.owner_id
			  AND repositories.id = pushes.repository_id
			  AND cast(pushes.created_at AS DATE) BETWEEN "''' + str(timeRange[0]) + '''" and "''' + str(timeRange[1]) + '''"
			GROUP BY orgs.id,
			         pushes.pusher_id
		'''
		return query

	def query(self, date):
		timeRange = [date - datetime.timedelta(365), date]
		query = '''
			SELECT source.entity AS source,
			       target.entity AS target,
			       COUNT(*) AS entity_count
			FROM
			  (''' + self.pushersPerOrgSubquery(timeRange) + ''') AS source
			  LEFT JOIN
			  (''' + self.pushersPerOrgSubquery(timeRange) + ''') AS target
			  ON source.pusher_id = target.pusher_id
			WHERE source.entity_id != target.entity_id AND source.push_count >= target.push_count
			GROUP BY source.entity_id,
			         target.entity_id
			ORDER BY entity_count DESC
			LIMIT 60
		'''
		return query
