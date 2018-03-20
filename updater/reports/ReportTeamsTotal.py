from .ReportDaily import *

# Lists the total number of organizations
class ReportTeamsTotal(ReportDaily):
	def name(self):
		return "teams-total"

	def updateDailyData(self):
		newHeader, newData = self.parseData(self.executeQuery(self.query()))
		self.header = newHeader if newHeader else self.header
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self):
		return '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				COUNT(*) AS total
			FROM
				teams, users AS orgs
			WHERE
				teams.organization_id = orgs.id
				''' + self.andExcludedEntities("orgs.login")
