from .Report import *


class ReportAPIRequestsByUser(Report):

	def name(self):
		return "api-requests-by-user"

	def readData(self):
		pass

	def updateData(self):

		self.header = [ "user", "0h", "1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h" ]

		data = {}
		stdin = None

		with open(self.scriptPath("api-requests-by-user.sh")) as f:
			stdin = f.read()

		for row in csv.reader(self.executeScript([ "bash -s", "--", self.yesterday().strftime("%Y-%m-%d") ], stdin).decode("utf-8").splitlines()):
			hour, user, reqs = row
			if not user in data:
				data[user] = {}
			data[user][int(hour)] = reqs

		for user in data:
			self.data.append([ user ] + [ data[user][hour] if hour in data[user] else "0" for hour in range(24) ])
