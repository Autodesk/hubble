#!/usr/bin/python3

from .ReportDaily import *

# Lists which git version was used by how many users yesterday
class ReportLDAPAuthentication(ReportDaily):
	def name(self):
		return "ldap-authentication"

	def updateDailyData(self):
		self.detailedHeader, newData = self.parseData(
			self.executeScript(os.path.join("scripts", "ldap-authentication.sh"))
		)
		if len(self.data) == 0:
			self.header = ["date", "LDAP Authentications/Day"]
		self.data.append(
			[str(self.yesterday()),
			sum(map(lambda x: int(x[2] if len(x) > 1 else 0), newData))]
		)
		self.detailedData = newData[:25]
		self.truncateData(self.timeRangeTotal())
		self.sortDataByDate()
