from .ReportDaily import *

# Lists the total number of organizations
class ReportOrgsTotal(ReportDaily):
	def name(self):
		return "orgs-total"

	def updateDailyData(self):
		self.header, newData = self.parseData(self.executeDatabaseQueryOnServer(self.query()))
		self.data.extend(newData)
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()

	def query(self):
		return '''
			SELECT
				"''' + str(self.yesterday()) + '''" AS date,
				COUNT(*) AS total
			FROM
				users AS orgs
			WHERE
				orgs.type = "Organization"
				''' + self.andExcludedEntities("orgs.login")
