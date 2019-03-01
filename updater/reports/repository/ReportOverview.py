from ..Report import *

# Lists the name and the size of the repository
class ReportOverview(Report):
	def name(self):
		return "overview"

	def metaName(self):
		return self.repository + "/overview"

	def fileName(self):
		return os.path.join(self.dataDirectory, "repository", self.repositoryOwner, self.repositoryName, self.name() + ".tsv")

	# The data is overwritten every day, so skip reading the old data
	def readData(self):
		pass

	def updateData(self):
		self.header, self.data = self.parseData(
			self.executeQuery(self.query()))

		# Convert result into a list of keys and values
		self.header = ['key', 'value']
		name = self.data[0][0]
		size = self.data[0][1]

		# Show size in MB
		size = str(round(int(size) / 1000)) + " MB"

		self.data = [
			["Repository Name", name],
			["Repository Size", size]
		]

	# Collect repository name and size
	def query(self):
		return '''
			SELECT
				CONCAT(users.login, "/", repositories.name) AS repository,
				repositories.disk_usage
			FROM
				repositories
				JOIN users on users.id = repositories.owner_id
			WHERE
				users.login = "''' + self.repositoryOwner + '''"
				AND repositories.name = "''' + self.repositoryName + '''"
			'''